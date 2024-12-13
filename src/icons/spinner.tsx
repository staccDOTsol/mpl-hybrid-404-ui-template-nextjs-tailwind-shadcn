import { CSSProperties, FC } from "react";

interface SpinnerProps {
  className?: string;
  style?: CSSProperties;
}

const Spinner: FC<SpinnerProps> = ({ className, style }) => {
  return <span className={`loader ${className}`} style={style}></span>;
};

export default Spinner;
