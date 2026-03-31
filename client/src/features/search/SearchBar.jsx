import React, { useState } from 'react'
import axios from "axios";

function SearchBar({setUsers}) {
    const [query,setQuery]=useState("");

    const search=async()=>{
        const res=await axios.get(`http://localhost:3000/search/${query}`);
        setUsers(res.data);
    };
  return (
    <div className='card'>
        <h2>Search Users</h2>
        <input
            placeholder='Search by name/department'
            onChange={(e)=>setQuery(e.target.value)}
        />
        <div className='btn-group'>
            <button onClick={search}>Search</button>
        </div>
    </div>
  );
}

export default SearchBar