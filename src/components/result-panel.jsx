import { useEffect, useRef } from "react";
import { authFormClass, kicker, editorial } from "../constants/class-names";

export default function ResultPanel({ kickerText, title, body, action }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className={authFormClass}>
      <span className={kicker}>{kickerText}</span>
      <h2
        ref={headingRef}
        id="auth-result"
        tabIndex={-1}
        aria-describedby="auth-result-body"
        className={`${editorial} text-[clamp(40px,5vw,54px)]`}
      >
        {title}
      </h2>
      <p
        id="auth-result-body"
        className="max-w-[420px] text-[13px] leading-[1.75] text-muted"
      >
        {body}
      </p>
      <div className="mt-auto">{action}</div>
    </div>
  );
}
