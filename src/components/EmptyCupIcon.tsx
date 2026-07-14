export default function EmptyCupIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M6 4H18L17 20H7L6 4Z"
        fill="white"
        stroke="#555"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}