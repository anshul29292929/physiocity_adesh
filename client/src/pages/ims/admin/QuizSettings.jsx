import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Save, RefreshCcw, Clock, Settings2, BarChart } from 'lucide-react';

const QuizSettings = () => {
    const { backendUrl, adminToken } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        questionCount: 15,
        difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
        enableTimer: true,
        dailyQuizEnabled: true,
        dailyQuizTime: "09:00",
        dailyQuestionCount: 10
    });

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/config`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (adminToken) fetchConfig();
    }, [adminToken]);

    const handleDistChange = (field, value) => {
        const val = parseInt(value) || 0;
        setConfig({
            ...config,
            difficultyDistribution: { ...config.difficultyDistribution, [field]: val }
        });
    };

    const handleSave = async () => {
        const total = config.difficultyDistribution.easy + config.difficultyDistribution.medium + config.difficultyDistribution.hard;
        if (total !== 100) {
            toast.error("Difficulty distribution must sum up to 100%");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/quiz/config`, config, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                toast.success("Settings updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Quiz Configurations</h1>
                        <p className="text-slate-500 text-sm">Control auto-generation rules and daily schedules</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                        <Save size={20} /> {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Auto-Generation Rules */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <RefreshCcw size={20} className="text-indigo-500" /> Quiz Rule Engine
                        </h3>
                        
                        <section>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Questions Per Quiz</label>
                            <input 
                                type="number" 
                                className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border transition-all"
                                value={config.questionCount}
                                onChange={(e) => setConfig({ ...config, questionCount: e.target.value })}
                            />
                        </section>

                        <section className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">Difficulty Distribution (%)</label>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 bg-slate-50 rounded-xl outline-none text-center border-b-2 border-green-500 focus:bg-white"
                                        value={config.difficultyDistribution.easy}
                                        onChange={(e) => handleDistChange('easy', e.target.value)}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Easy</span>
                                </div>
                                <div>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 bg-slate-50 rounded-xl outline-none text-center border-b-2 border-amber-500 focus:bg-white"
                                        value={config.difficultyDistribution.medium}
                                        onChange={(e) => handleDistChange('medium', e.target.value)}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Medium</span>
                                </div>
                                <div>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 bg-slate-50 rounded-xl outline-none text-center border-b-2 border-red-500 focus:bg-white"
                                        value={config.difficultyDistribution.hard}
                                        onChange={(e) => handleDistChange('hard', e.target.value)}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Hard</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold ${config.difficultyDistribution.easy + config.difficultyDistribution.medium + config.difficultyDistribution.hard === 100 ? 'text-green-500' : 'text-red-500'}`}>
                                    Total: {config.difficultyDistribution.easy + config.difficultyDistribution.medium + config.difficultyDistribution.hard}%
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* Daily Quiz Settings */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-500" /> Daily Quiz Schedule
                        </h3>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="text-sm font-bold text-slate-700">Enable Daily Quiz</span>
                            <div 
                                onClick={() => setConfig({ ...config, dailyQuizEnabled: !config.dailyQuizEnabled })}
                                className={`w-12 h-6 rounded-full cursor-pointer transition-all relative ${config.dailyQuizEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.dailyQuizEnabled ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </div>

                        <section>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Daily Questions Count</label>
                            <input 
                                type="number" 
                                className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border transition-all"
                                value={config.dailyQuestionCount}
                                onChange={(e) => setConfig({ ...config, dailyQuestionCount: e.target.value })}
                            />
                        </section>

                        <section>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Release Time (IST)</label>
                            <input 
                                type="time" 
                                className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border transition-all"
                                value={config.dailyQuizTime}
                                onChange={(e) => setConfig({ ...config, dailyQuizTime: e.target.value })}
                            />
                        </section>
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-50 pb-4">Global Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureToggle 
                            label="Quiz Timer" 
                            desc="Enable/Disable countdown timer for all mixed quizzes"
                            enabled={config.enableTimer}
                            onToggle={() => setConfig({ ...config, enableTimer: !config.enableTimer })}
                        />
                        <FeatureToggle 
                            label="Image-Based Questions" 
                            desc="Allow AI to pick questions with medical illustrations"
                            enabled={true}
                            onToggle={() => {}}
                            disabled={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureToggle = ({ label, desc, enabled, onToggle, disabled }) => (
    <div className={`p-6 rounded-2xl border ${enabled ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/50'} flex justify-between items-center transition-all ${disabled && 'opacity-50 cursor-not-allowed'}`}>
        <div>
            <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
        </div>
        <div 
            onClick={!disabled ? onToggle : undefined}
            className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-5.5' : 'left-0.5'}`}></div>
        </div>
    </div>
);

export default QuizSettings;
