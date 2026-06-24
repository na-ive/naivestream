export function AnimeTitleDisplay({ title, titleEnglish }: { title: string; titleEnglish?: string }) {
  if (!titleEnglish) return <>{title}</>;
  
  return (
    <>
      <span className="title-jp">{title}</span>
      <span className="title-en">{titleEnglish}</span>
    </>
  );
}
