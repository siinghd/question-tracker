export default function QuestionLayout(props: {
  children: React.ReactNode;
  question: React.ReactNode;
  answers: React.ReactNode;
}) {
  return (
    <>
      {props.children}
      {props.question}
      {props.answers}
    </>
  );
} 
