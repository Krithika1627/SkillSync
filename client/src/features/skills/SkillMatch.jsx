import React, { useState } from 'react'
import axios from "axios";

function SkillMatch() {
    const [skill,setSkill]=useState("");
    const [results,setResults]=useState([]);

    const match=async()=>{
        const res=await axios.get(`http://localhost:3000/match/${skill}`);
        setResults(res.data);
    };
  return (
    <div className='card'>
        <h2>Skill Matching</h2>
        <input
            placeholder='Enter skill (eg. Python)'
            onChange={(e)=>setSkill(e.target.value)}
        />
        <div className='btn-group'>
            <button onClick={match}>Find</button>
        </div>
        {results.map((r,i)=>(
            <p key={i}>{r.join(" ")}</p>
        ))}
    </div>
  );
}

export default SkillMatch