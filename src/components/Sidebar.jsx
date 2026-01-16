import { FileText, Star, Trash2, X } from 'lucide-react';

const Sidebar = ({ activeView, onSelectView, isOpen, onClose }) => {
    const menuItems = [
        { id: 'all', label: 'All Notes', icon: FileText },
        { id: 'favorites', label: 'Favorites', icon: Star },
        { id: 'trash', label: 'Trash', icon: Trash2 },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar drawer */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 flex flex-col shadow-2xl md:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        NoteCloud
                    </h1>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white md:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelectView(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeView === item.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 text-xs text-gray-600 border-t border-gray-800 flex items-center justify-between">
                    <span>v1.0.0</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-700">Cloud Storage</span>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
