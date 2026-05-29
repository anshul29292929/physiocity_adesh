import React, { useContext, useEffect } from 'react'
import QuizEngine from '../../../components/QuizEngine'
import QuizList from '../../../components/QuizList'
import { QuizContext } from '../../../context/QuizContext'
import { AppContext } from '../../../context/AppContext'
import { useNavigate, useLocation } from 'react-router-dom'

const QuizPage = () => {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { redirect: location.pathname } });
    }
  }, [token, navigate, location.pathname]);

  if (!token) return null;

  return (
    <div className='pt-32 pb-16 bg-slate-50 min-h-screen'>
      <QuizList />
    </div>
  )
}

export default QuizPage
