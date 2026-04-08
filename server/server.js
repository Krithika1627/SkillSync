import express from "express";
import cors from "cors";
import oracledb from "oracledb";

const app = express();

app.use(cors());
app.use(express.json());

// DB connection config
const dbConfig = {
  user: "system",
  password: "password",
  connectString: "localhost:1521/XEPDB1"
};

// GET USERS
app.get("/users", async (req, res) => {
  const conn = await oracledb.getConnection(dbConfig);

  const result = await conn.execute(`
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.department,
      u.year,
      NVL(
        LISTAGG(s.skill_name || ' (' || us.proficiency_level || ')', ', ') 
        WITHIN GROUP (ORDER BY s.skill_name),
        'None'
      ) AS skills
    FROM USERS u
    LEFT JOIN USER_SKILL us ON u.user_id = us.user_id
    LEFT JOIN SKILL s ON us.skill_id = s.skill_id
    GROUP BY 
      u.user_id, u.first_name, u.last_name, 
      u.email, u.department, u.year
  `);

  res.json(result.rows);
  await conn.close();
});

app.post("/users", async (req, res) => {
  let conn;

  try {
    const { first_name, last_name, email, department, year, skills } = req.body;

    conn = await oracledb.getConnection(dbConfig);

    // 🔥 INSERT USER
    const result = await conn.execute(
      `INSERT INTO USERS (user_id, first_name, last_name, email, department, year)
       VALUES (user_seq.NEXTVAL, :1, :2, :3, :4, :5)
       RETURNING user_id INTO :id`,
      {
        1: first_name,
        2: last_name,
        3: email,
        4: department,
        5: Number(year),
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const user_id = result.outBinds.id[0];

    // 🔥 HANDLE SKILLS
    const skillList = skills.split(",");

    for (let s of skillList) {
      let [skill, level] = s.split("-");

      if (!skill) continue;

      skill = skill.trim();
      level = level ? level.trim() : "Intermediate";

      const skillRes = await conn.execute(
        "SELECT skill_id FROM SKILL WHERE LOWER(skill_name)=LOWER(:1)",
        [skill]
      );

      let skill_id;

      if (skillRes.rows.length === 0) {
        const newSkill = await conn.execute(
          `INSERT INTO SKILL (skill_id, skill_name)
          VALUES (skill_seq.NEXTVAL, :name)
          RETURNING skill_id INTO :id`,
          {
            name: skill,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          }
        );

        if (!newSkill.outBinds?.id) {
          throw new Error("Skill insert failed");
        }

        skill_id = newSkill.outBinds.id[0];

      } else {
        skill_id = skillRes.rows[0][0];
      }

      await conn.execute(
        "INSERT INTO USER_SKILL (user_id, skill_id, proficiency_level) VALUES (:1, :2, :3)",
        [user_id, skill_id, level],
        { autoCommit: true }
      );
    }

    res.send("User registered");

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.put("/users/:id", async (req, res) => {
  let conn;

  try {
    const { first_name, last_name, email, department, year, skills } = req.body;

    const userId = Number(req.params.id);

    const yearNum = year ? Number(year) : null;

    if (year && isNaN(yearNum)) {
      return res.status(400).send("Year must be a valid number");
    }

    conn = await oracledb.getConnection(dbConfig);

    // 🔥 UPDATE USER DETAILS
    await conn.execute(
      `UPDATE USERS 
       SET first_name=:1, last_name=:2, email=:3, department=:4, year=:5
       WHERE user_id=:6`,
      [first_name, last_name, email, department, yearNum, userId],
      { autoCommit: true }
    );

    // 🔥 DELETE OLD SKILLS
    await conn.execute(
      "DELETE FROM USER_SKILL WHERE user_id = :1",
      [userId],
      { autoCommit: true }
    );

    // 🔥 ADD NEW SKILLS (same as POST)
    if (skills && skills.trim() !== "") {
      const skillList = skills.split(",");

      for (let s of skillList) {
        let [skill, level] = s.split("-");

        if (!skill) continue;

        skill = skill.trim();
        level = level ? level.trim() : "Intermediate";

        const skillRes = await conn.execute(
          "SELECT skill_id FROM SKILL WHERE LOWER(skill_name)=LOWER(:1)",
          [skill]
        );

        let skill_id;

        if (skillRes.rows.length === 0) {
          const newSkill = await conn.execute(
            `INSERT INTO SKILL (skill_id, skill_name)
             VALUES (skill_seq.NEXTVAL, :name)
             RETURNING skill_id INTO :id`,
            {
              name: skill,
              id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
          );

          skill_id = newSkill.outBinds.id[0];
        } else {
          skill_id = skillRes.rows[0][0];
        }

        await conn.execute(
          "INSERT INTO USER_SKILL (user_id, skill_id, proficiency_level) VALUES (:1, :2, :3)",
          [userId, skill_id, level],
          { autoCommit: true }
        );
      }
    }

    res.send("User updated successfully");

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.delete("/users/:id", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);
    const id = req.params.id;

    // 🔥 RATING
    await conn.execute(
      "DELETE FROM RATING WHERE giver_id=:1 OR receiver_id=:2",
      [id, id]
    );

    // 🔥 MESSAGE
    await conn.execute(
      "DELETE FROM MESSAGE WHERE sender_id=:1 OR receiver_id=:2",
      [id, id]
    );

    // 🔥 TEAM_MEMBER (direct)
    await conn.execute("DELETE FROM TEAM_MEMBER WHERE user_id=:1", [id]);

    // 🔥 JOIN_REQUEST
    await conn.execute("DELETE FROM JOIN_REQUEST WHERE user_id=:1", [id]);

    // 🔥 USER_SKILL
    await conn.execute("DELETE FROM USER_SKILL WHERE user_id=:1", [id]);

    // 🔥 USER_AVAILABILITY
    await conn.execute("DELETE FROM USER_AVAILABILITY WHERE user_id=:1", [id]);

    // 🔥 HANDLE PROJECT DEPENDENCIES

    // 1. Delete PROJECT_SKILL first
    await conn.execute(`
      DELETE FROM PROJECT_SKILL 
      WHERE project_id IN (
        SELECT project_id FROM PROJECT WHERE user_id=:1
      )
    `, [id]);

    // 2. Delete TEAM_MEMBER linked to those projects
    await conn.execute(`
      DELETE FROM TEAM_MEMBER 
      WHERE team_id IN (
        SELECT team_id FROM TEAM 
        WHERE project_id IN (
          SELECT project_id FROM PROJECT WHERE user_id=:1
        )
      )
    `, [id]);

    // 3. Delete TEAM
    await conn.execute(`
      DELETE FROM TEAM 
      WHERE project_id IN (
        SELECT project_id FROM PROJECT WHERE user_id=:1
      )
    `, [id]);

    // 4. Delete PROJECT
    await conn.execute(
      "DELETE FROM PROJECT WHERE user_id=:1",
      [id]
    );

    // 🔥 FINALLY USER
    await conn.execute(
      "DELETE FROM USERS WHERE user_id=:1",
      [id],
      { autoCommit: true }
    );

    res.send("User deleted successfully");

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).send(err.message);
  } finally {
    if (conn) await conn.close();
  }
});

app.put("/users/:id", async (req, res) => {
  let conn;

  try {
    const { first_name, last_name, email, department, year } = req.body;

    const userId = Number(req.params.id);

    // 🔥 Handle year safely
    const yearNum = year ? Number(year) : null;

    if (year && isNaN(yearNum)) {
      return res.status(400).send("Year must be a valid number");
    }

    conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `UPDATE USERS 
       SET first_name=:1, last_name=:2, email=:3, department=:4, year=:5
       WHERE user_id=:6`,
      [first_name, last_name, email, department, yearNum, userId],
      { autoCommit: true }
    );

    res.send("User updated");

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

// SEARCH USERS
app.get("/search/:query", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `SELECT * FROM USERS 
       WHERE LOWER(first_name) LIKE :q 
       OR LOWER(department) LIKE :q`,
      [`%${req.params.query.toLowerCase()}%`]
    );

    res.json(result.rows);

    await conn.close();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// SKILL MATCH
app.get("/match/:skill", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(`
      SELECT u.first_name, u.last_name
      FROM USERS u
      JOIN USER_SKILL us ON u.user_id = us.user_id
      JOIN SKILL s ON us.skill_id = s.skill_id
      WHERE LOWER(s.skill_name) = :skill
    `, [req.params.skill.toLowerCase()]);

    res.json(result.rows);

    await conn.close();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//DASHBOARD STATS
app.get("/dashboard", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const users = await conn.execute("SELECT COUNT(*) FROM USERS");
    const projects = await conn.execute("SELECT COUNT(*) FROM PROJECT");
    const requests = await conn.execute(
      "SELECT COUNT(*) FROM JOIN_REQUEST WHERE request_status='Pending'"
    );

    res.json({
      users: users.rows[0][0],
      projects: projects.rows[0][0],
      requests: requests.rows[0][0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.get("/projects", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `SELECT 
        p.project_id,
        p.title,
        p.description,
        p.status,
        u.first_name,
        u.last_name,
        p.user_id,
        NVL(
          LISTAGG(s.skill_name, ', ') 
          WITHIN GROUP (ORDER BY s.skill_name),
          'None'
        ) AS skills
      FROM PROJECT p
      JOIN USERS u ON p.user_id = u.user_id
      LEFT JOIN PROJECT_SKILL ps ON p.project_id = ps.project_id
      LEFT JOIN SKILL s ON ps.skill_id = s.skill_id
      GROUP BY 
        p.project_id, p.title, p.description, 
        p.status, u.first_name, u.last_name, p.user_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // 🔥 IMPORTANT
    );

    const projects = result.rows.map(row => ({
      project_id: row.PROJECT_ID,
      title: row.TITLE,
      description: row.DESCRIPTION,
      status: row.STATUS,
      first_name: row.FIRST_NAME,
      last_name: row.LAST_NAME,
      user_id: row.USER_ID,
      skills: row.SKILLS
    }));
    
    res.json(projects);

  } catch (err) {
    console.error("PROJECT FETCH ERROR:", err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.post("/projects", async (req, res) => {
  let conn;

  try {
    const { title, description, user_id, skill } = req.body;

    const userId = Number(user_id);

    if (!userId || isNaN(userId)) {
      return res.status(400).send("Invalid user_id");
    }

    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `INSERT INTO PROJECT (project_id, title, description, status, user_id)
      VALUES (project_seq.NEXTVAL, :1, :2, 'Open', :3)
      RETURNING project_id INTO :id`,
      {
        1: title,
        2: description,
        3: userId, // ✅ fixed
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const project_id = result.outBinds.id[0];

    // 🔥 HANDLE SKILLS
    if (skill && skill.trim() !== "") {

      const skillList = skill.split(",");

      for (let s of skillList) {

        if (!s) continue;

        s = s.trim();

        const skillRes = await conn.execute(
          "SELECT skill_id FROM SKILL WHERE LOWER(skill_name)=LOWER(:1)",
          [s]
        );

        let skill_id;

        if (skillRes.rows.length === 0) {

          const newSkill = await conn.execute(
            `INSERT INTO SKILL (skill_id, skill_name)
             VALUES (skill_seq.NEXTVAL, :name)
             RETURNING skill_id INTO :id`,
            {
              name: s,
              id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
          );

          if (!newSkill.outBinds?.id) {
            throw new Error("Skill insert failed");
          }

          skill_id = newSkill.outBinds.id[0];

        } else {
          skill_id = skillRes.rows[0][0];
        }

        await conn.execute(
          "INSERT INTO PROJECT_SKILL (project_id, skill_id, importance_level) VALUES (:1, :2, :3)",
          [project_id, skill_id, "HIGH"]
        );

      }
    }

    await conn.commit();

    res.send("Project created");

  } catch (err) {
    console.error("PROJECT ERROR:", err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.delete("/projects/:id", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);
    const id = req.params.id;

    // 🔥 delete dependencies first
    await conn.execute("DELETE FROM PROJECT_SKILL WHERE project_id=:1", [id]);
    await conn.execute("DELETE FROM TEAM WHERE project_id=:1", [id]);
    await conn.execute("DELETE FROM JOIN_REQUEST WHERE project_id=:1", [id]);

    // 🔥 delete project
    await conn.execute(
      "DELETE FROM PROJECT WHERE project_id=:1",
      [id],
      { autoCommit: true }
    );

    res.send("Project deleted");

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.post("/request", async (req, res) => {
  try {
    const { request_id, user_id, project_id } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `INSERT INTO JOIN_REQUEST 
       VALUES (:1, :2, :3, 'Pending', SYSDATE)`,
      [request_id, user_id, project_id],
      { autoCommit: true }
    );

    res.send("Request sent");

    await conn.close();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get("/requests", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(`
      SELECT r.request_id, u.first_name, p.title, r.request_status, p.user_id, r.user_id
      FROM JOIN_REQUEST r
      JOIN USERS u ON r.user_id = u.user_id
      JOIN PROJECT p ON r.project_id = p.project_id
    `);

    res.json(result.rows);

    await conn.close();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.put("/requests/accept/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `UPDATE JOIN_REQUEST 
       SET request_status = 'Accepted'
       WHERE request_id = :1`,
      [req.params.id],
      { autoCommit: true }
    );

    res.send("Accepted");

    await conn.close();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.put("/requests/reject/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `UPDATE JOIN_REQUEST 
       SET request_status = 'Rejected'
       WHERE request_id = :1`,
      [req.params.id],
      { autoCommit: true }
    );

    res.send("Rejected");

    await conn.close();
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  let conn;

  try {
    const email = req.body.email.trim();

    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      "SELECT user_id, first_name FROM USERS WHERE LOWER(email) = LOWER(:1)",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("User not found");
    }

    const user = result.rows[0];

    res.json({
      user_id: user[0],
      name: user[1]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.get("/user-skills/:id", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `SELECT s.skill_name, us.proficiency_level
       FROM USER_SKILL us
       JOIN SKILL s ON us.skill_id = s.skill_id
       WHERE us.user_id = :id`,
      [req.params.id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);

  } finally {
    if (conn) await conn.close();
  }
});

app.post("/message", async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `INSERT INTO MESSAGE (message_id, sender_id, receiver_id, content, timestamp)
       VALUES (message_seq.NEXTVAL, :sender_id, :receiver_id, :content, SYSDATE)`,
      {
        sender_id: Number(sender_id),
        receiver_id: Number(receiver_id),
        content: content
      },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Message sent" });

  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err); // 👈 better debug
    res.status(500).send("Error sending message");
  }
});

app.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const user1 = Number(req.params.user1);
    const user2 = Number(req.params.user2);
    if (isNaN(user1) || isNaN(user2)) {
      console.log("Invalid params:", req.params);
      return res.status(400).send("Invalid user IDs");
    }
    
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `SELECT m.sender_id, m.receiver_id, m.content, m.timestamp, u.first_name
       FROM MESSAGE m join USERS u on m.sender_id=u.user_id
       WHERE (sender_id = :user1 AND receiver_id = :user2)
          OR (sender_id = :user2 AND receiver_id = :user1)
       ORDER BY timestamp`,
      {
        user1: user1,
        user2: user2
      }
    );

    res.json(result.rows);

  } catch (err) {
    console.error("MESSAGE FETCH ERROR:", err);
    res.status(500).send("Error fetching messages");
  }
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});