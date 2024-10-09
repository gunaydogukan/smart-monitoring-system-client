import Sidebar from "../components/Sidebar";

export default function Layout({ children }) {
    return (
        <div style={{width: '100%', display: "flex", flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'red', height: '100vh'}}>

            <div style={{width: '15%', backgroundColor: 'gray', height: '100%', marginBottom: '32px'}}>
                <Sidebar/>
            </div>

            <div style={{width: '100%', backgroundColor: 'white', height: '100%'}}>
                {children}
            </div>

        </div>
    );
}