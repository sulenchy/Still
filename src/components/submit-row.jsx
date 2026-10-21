export default function SubmitRow({ note, alternate, children }) {
  return (
    <div className="mt-auto flex flex-col gap-5">
      <small className="text-[12px] leading-[1.5] text-muted">
        {note}
      </small>
      {children}
      {alternate ? (
        <div className="text-[13px] leading-[1.75] text-muted">{alternate}</div>
      ) : null}
    </div>
  );
}