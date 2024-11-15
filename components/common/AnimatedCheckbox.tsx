import React from "react";

const AnimatedCheckbox: React.FC<{
  id?: string;
  className?: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id = "cbx", className = "", name, checked, onChange }) => {
  return (
    <>
      <style jsx>{`
        .animated-checkbox svg {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke: #c8ccd4;
          stroke-width: 1.5;
        }
        .animated-checkbox svg path {
          stroke-dasharray: 60;
          stroke-dashoffset: 0;
          transition: all 0.3s linear;
        }
        .animated-checkbox svg polyline {
          stroke-dasharray: 22;
          stroke-dashoffset: 66;
          transition: all 0.2s linear;
        }
        .animated-checkbox:hover svg {
          stroke: #003465;
        }
        input:checked + .animated-checkbox svg {
          stroke: #003465;
        }
        @media (prefers-color-scheme: dark) {
          input:checked + .animated-checkbox svg {
            stroke: #015b9a;
          }
        }
        @media (prefers-color-scheme: dark) {
          .animated-checkbox:hover svg {
            stroke: #015b9a;
          }
        }
        input:checked + .animated-checkbox svg path {
          stroke-dashoffset: 60;
        }
        input:checked + .animated-checkbox svg polyline {
          stroke-dashoffset: 42;
          transition-delay: 0.15s;
        }
        input:not(:checked) + .animated-checkbox svg path {
          transition-delay: 0.15s;
        }
        input:not(:checked) + .animated-checkbox svg polyline {
          stroke-dashoffset: 66;
          transition-delay: 0s;
        }
      `}</style>
      <div
        className={`inline-flex justify-center items-center w-[28px] ${className}`}
      >
        <input
          type="checkbox"
          id={id}
          className="hidden peer"
          name={name}
          checked={checked}
          onChange={onChange}
        />
        <label
          htmlFor={id}
          className="animated-checkbox cursor-pointer relative inline-block w-[18px] h-[18px]"
        >
          <svg
            width="18px"
            height="18px"
            viewBox="0 0 18 18"
            className="relative z-[1] transition-all duration-200 ease-in-out"
          >
            <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
            <polyline points="1 9 7 14 15 4"></polyline>
          </svg>
        </label>
      </div>
    </>
  );
};

export default AnimatedCheckbox;
