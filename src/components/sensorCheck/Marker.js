import React from 'react';

function Marker({ text, onClick }) {
    return (
        <div onClick={onClick} style={{
            color: "white",
            background: "blue",
            padding: "10px 5px",
            borderRadius: "50%",
            cursor: "pointer",
            textAlign: "center"
        }}>
            {text}
        </div>
    );
}

export default Marker;
