import "./Logo.css";

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <div className="logo">
      <div className="logo-mark">
        <div className="logo-mark-inner" />
      </div>
      <div className="logo-word" style={{ fontSize: size }}>
        Budgee
      </div>
    </div>
  );
}
