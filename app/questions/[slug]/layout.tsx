import Link from 'next/link';

export default function QuestionLayout(props: {
  children: React.ReactNode;
  question: React.ReactNode;
  answers: React.ReactNode;
}) {
  return (
    <>
      <Link href="/" className='sticky left-10 top-4'>Home</Link>
      {props.children}
      {props.question}
      <hr className="mt-5" />
      {props.answers}
    </>
  );
}
