export default function PrimaryButton({ children, onClick }) {
    return (
        <button
            style={{
                backgroundColor: '#007BFF',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'background-color 0.3s, transform 0.2s',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={onClick} // Dışarıdan gelen onClick fonksiyonunu ekledik
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
                e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#007BFF';
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {children}
        </button>
    );
}
