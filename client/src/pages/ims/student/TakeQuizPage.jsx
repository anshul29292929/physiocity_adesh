import React, { useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { QuizContext } from "../../../context/QuizContext";
import QuizEngine from "../../../components/QuizEngine";
import { ChevronLeft } from "lucide-react";
import { AppContext } from "../../../context/AppContext";

const TakeQuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useContext(AppContext);
    const { startQuiz, quizStarted, quizCompleted, resetQuiz } = useContext(QuizContext);

    useEffect(() => {
        if (!token) {
            navigate('/login', { state: { redirect: location.pathname } });
        }
    }, [token, navigate, location.pathname]);

    if (!token) return null;

    // Quiz is now started manually from within QuizEngine after reviewing rules
    // useEffect(() => {
    //     if (!quizStarted && !quizCompleted) {
    //         startQuiz(id);
    //     }
    // }, [id, quizStarted, quizCompleted]);

    const handleBack = () => {
        resetQuiz();
        navigate("/quiz");
    };

    return (
        <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-6 mb-8">
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    Back to Quizzes
                </button>
            </div>
            <QuizEngine />
        </div>
    );
};

export default TakeQuizPage;
