export default function WaterCupIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* 杯子轮廓 */}
      <path
        d="M6 4H18L17 20H7L6 4Z"
        fill="white"
        stroke="#555"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 蓝色的水 */}
      <path
        d="M7.5 8H16.5L16 18H8L7.5 8Z"
        fill="#4FC3F7"
      />
      {/* 水面波纹 */}
      <path
        d="M7.5 8Q9 9 10.5 8Q12 7 13.5 8Q15 9 16.5 8"
        stroke="#29B6F6"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}