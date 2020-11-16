import './App.css';
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import OpenProject from './components/OpenProject';
import Sidebar from './components/Sidebar';

function App() {
    return (
        <div className="App">
            <Sidebar />
            <OpenProject />
        </div>
    );
}

export default App;
