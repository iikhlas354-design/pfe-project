export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.pr-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 16px rgba(26,51,41,0.07);
  border: 1px solid rgba(79,158,122,0.1);
}

.pr-slide-in {
  animation: slideIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;