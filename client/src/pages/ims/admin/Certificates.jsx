import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Upload, X, Send, UserPlus, Users, Table, Trash2, Move } from 'lucide-react';
import { AppContext } from '../../../context/AppContext';

const Certificates = () => {
    const { backendUrl, adminToken } = useContext(AppContext);
    const [template, setTemplate] = useState(null);
    const [templateUrl, setTemplateUrl] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [namePos, setNamePos] = useState({ x: 50, y: 50, fontSize: 30, color: '#000000' });
    const [qrPos, setQrPos] = useState({ x: 85, y: 85, size: 100 });
    const [draggingId, setDraggingId] = useState(null); // 'name' or 'qr'
    const [manualName, setManualName] = useState('');
    const [manualEmail, setManualEmail] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    // Handle Template Upload
    const handleTemplateUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setTemplate(file);
            const formData = new FormData();
            formData.append('image', file);
            setIsUploading(true);

            try {
                const { data } = await axios.post(backendUrl + '/api/admin/upload-image', formData, {
                    headers: { admintoken: adminToken }
                });
                if (data.success) {
                    setTemplateUrl(data.imageUrl); 
                    toast.success('Template Uploaded');
                }
            } catch (error) {
                toast.error('Upload Failed');
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Excel Parsing
    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const formatted = data.map(item => ({
                    name: item.Name || item.name || item.NAME,
                    email: item.Email || item.email || item.EMAIL
                })).filter(item => item.name && item.email);

                setRecipients([...recipients, ...formatted]);
                toast.success(`Imported ${formatted.length} recipients`);
            };
            reader.readAsBinaryString(file);
        }
    };

    const addManualRecipient = () => {
        if (!manualName || !manualEmail) return toast.error('Fill both name and email');
        setRecipients([...recipients, { name: manualName, email: manualEmail }]);
        setManualName('');
        setManualEmail('');
    };

    const removeRecipient = (index) => {
        setRecipients(recipients.filter((_, i) => i !== index));
    };

    // Drag and Drop Logic for Position
    const handleDragStart = (id) => setDraggingId(id);
    const handleDragEnd = () => setDraggingId(null);

    const handleMouseMove = (e) => {
        if (!draggingId || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
        
        if (draggingId === 'name') {
            setNamePos({ ...namePos, x: xPercent, y: yPercent });
        } else if (draggingId === 'qr') {
            setQrPos({ ...qrPos, x: xPercent, y: yPercent });
        }
    };

    const sendBulk = async () => {
        if (!templateUrl || recipients.length === 0) return toast.error('Missing template or recipients');
        setIsSending(true);

        // Convert percentages back to actual pixel values for the backend
        // We'll send percentages and let backend handle it, or send calculated absolute values
        // Let's send percentages and image dimensions if possible, 
        // or just send the namePos as is and we'll calculate on backend or frontend.
        // Better: Backend needs absolute coordinates on the original image.
        
        // We will pass percentages and let backend handle it if we know image dimensions.
        // Actually, the easiest is to calculate absolute coordinates here based on the original image dimensions.
        const img = new Image();
        img.src = templateUrl;
        img.onload = async () => {
            const absX = (namePos.x / 100) * img.width;
            const absY = (namePos.y / 100) * img.height;
            const scaledFontSize = (namePos.fontSize / 1000) * img.width;

            const absQrX = (qrPos.x / 100) * img.width;
            const absQrY = (qrPos.y / 100) * img.height;
            const absQrSize = (qrPos.size / 1000) * img.width;

            try {
                const { data } = await axios.post(backendUrl + '/api/admin/send-certificates', {
                    recipients,
                    templateUrl,
                    namePosition: { 
                        x: Math.round(absX), 
                        y: Math.round(absY), 
                        fontSize: Math.round(scaledFontSize),
                        color: namePos.color 
                    },
                    qrPosition: {
                        x: Math.round(absQrX),
                        y: Math.round(absQrY),
                        size: Math.round(absQrSize)
                    }
                }, { headers: { admintoken: adminToken } });

                if (data.success) {
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsSending(false);
            }
        };
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Certificate Generation</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Preview & Positioning */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Move size={20} className="text-blue-500" /> Positoning Preview
                            </h2>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 block">Font Size</label>
                                    <input type="number" value={namePos.fontSize} onChange={(e) => setNamePos({...namePos, fontSize: e.target.value})} 
                                        className="w-16 border rounded px-2 py-1 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block">Color</label>
                                    <input type="color" value={namePos.color} onChange={(e) => setNamePos({...namePos, color: e.target.value})} 
                                        className="w-10 h-8 border rounded" />
                                </div>
                            </div>
                        </div>

                        <div 
                            ref={containerRef}
                            className="relative border-2 border-dashed border-slate-200 rounded-lg overflow-hidden bg-slate-50 min-h-[300px] flex items-center justify-center"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                        >
                            {templateUrl ? (
                                <>
                                    <img 
                                        ref={imageRef}
                                        src={templateUrl} 
                                        alt="Certificate Template" 
                                        className="max-w-full h-auto"
                                    />
                                    <div 
                                        onMouseDown={() => handleDragStart('name')}
                                        style={{ 
                                            position: 'absolute', 
                                            left: `${namePos.x}%`, 
                                            top: `${namePos.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            cursor: 'move',
                                            color: namePos.color,
                                            fontSize: `${namePos.fontSize}px`,
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            userSelect: 'none',
                                            backgroundColor: draggingId === 'name' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            zIndex: 20
                                        }}
                                    >
                                        Sample Student Name
                                    </div>

                                    <div 
                                        onMouseDown={() => handleDragStart('qr')}
                                        style={{ 
                                            position: 'absolute', 
                                            left: `${qrPos.x}%`, 
                                            top: `${qrPos.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            cursor: 'move',
                                            width: `${qrPos.size}px`,
                                            height: `${qrPos.size}px`,
                                            backgroundColor: 'white',
                                            border: draggingId === 'qr' ? '2px solid #2563eb' : '1px solid #ddd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            zIndex: 20
                                        }}
                                    >
                                        <div className="text-[8px] font-bold text-black border border-black p-1">QR CODE</div>
                                        <div className="text-[6px] text-blue-600 mt-1 truncate w-full px-1">https://physiocity.org/...</div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto text-slate-300 mb-2" size={48} />
                                    <p className="text-slate-400">Upload a certificate template to begin</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 flex gap-4">
                            <label className="flex-1">
                                <span className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                                    <Upload size={18} /> {isUploading ? 'Uploading...' : 'Change Template'}
                                    <input type="file" className="hidden" onChange={handleTemplateUpload} disabled={isUploading} accept="image/*" />
                                </span>
                            </label>
                            {templateUrl && (
                                <button onClick={() => setTemplateUrl('')} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Recipients */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" /> Recipients ({recipients.length})
                        </h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <label className="flex-1">
                                    <span className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium cursor-pointer hover:bg-blue-100 transition-all">
                                        <Table size={16} /> Import Excel
                                        <input type="file" className="hidden" onChange={handleExcelUpload} accept=".xlsx, .xls" />
                                    </span>
                                </label>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase">Manual Add</p>
                                <input placeholder="Full Name" value={manualName} onChange={(e) => setManualName(e.target.value)} 
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                                <input placeholder="Email Address" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} 
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                                <button onClick={addManualRecipient} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-900">
                                    <UserPlus size={16} /> Add Recipient
                                </button>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                {recipients.map((r, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 group">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold truncate">{r.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{r.email}</p>
                                        </div>
                                        <button onClick={() => removeRecipient(index)} className="text-slate-300 hover:text-red-500 transition-all">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {recipients.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-slate-400 italic">No recipients added yet</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={sendBulk}
                                disabled={isSending || recipients.length === 0 || !templateUrl}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                                    isSending || recipients.length === 0 || !templateUrl
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                }`}
                            >
                                <Send size={20} /> {isSending ? 'Sending Batch...' : 'Send All Certificates'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificates;
