export default function SidebarItem({ children, style }) {
    return (
        <div style={{
            width: '100%',
            padding: '8px 0',
            display: "flex",
            alignItems: 'center',
            justifyContent: 'center',
            ...style
        }}>
            {children}
        </div>
    );
}
