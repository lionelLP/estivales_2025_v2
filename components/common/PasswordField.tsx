import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { gsap } from "gsap";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const FormField = styled(motion.div)`
  --c-text: #5a5a64;
  --c-text-light: #a3a3a3;
  --c-background: #fff;
  --c-border: #e2e2ed;
  --c-border-hover: #d0d0db;
  --c-shadow: rgba(41, 41, 86, 0.06);
  --eye-background: 0;
  --eye-offset: 3px;
  --eye-wrapper-y: 0;
  --eye-y: 0px;
  --eye-x: 0px;
  --eye-s: 1;
  width: 100%;
  position: relative;
  border-radius: 7px;
  background: var(--c-background);
  transition: box-shadow 0.25s;
  overflow: hidden;

  padding: 2px;

  &:hover {
    --eye-duration: 0.05s;
  }

  @media (prefers-color-scheme: dark) {
    --c-background: rgb(39 39 42);
  }
`;

const Input = styled.input`
  display: block;
  font-family: inherit;
  font-size: 16px;
  line-height: 21px;
  width: 100%;
  height: 38px;
  background: rgb(249 250 251);
  border: none;
  padding: 8px 39px 8px 8px;
  outline: none;
  border-radius: 6px;
  transition: filter 0.3s, transform 0.3s, opacity 0.25s, background-color 0.3s;
  font-size: 14px;
  line-height: 20px;

  &::placeholder {
    color: var(--c-text-light);
    transition: color 0.25s;
  }

  &:focus::placeholder,
  &:hover::placeholder {
    color: var(--c-text);
  }
  @media (prefers-color-scheme: dark) {
    &:focus::placeholder,
    &:hover::placeholder {
      color: rgb(249 250 251);
    }
  }

  &::selection {
    color: white;
    background: var(--red-brou);
  }

  @media (prefers-color-scheme: dark) {
    background: rgb(39 39 42);
  }
`;

const ClearInput = styled(Input)`
  position: absolute;
  left: 0;
  top: 2px;
  width: calc(100% - 4px);
  margin-left: 2px;
  right: 0;
`;

const Button = styled.button`
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  padding: 8px;
  position: absolute;
  z-index: 1;
  right: 3px;
  top: 3px;
  background: none;
  border: none;
  outline: none;
  color: var(--c-text-light);
  transition: color 0.25s, transform 0.15s;

  &:hover {
    color: var(--c-text);
  }

  @media (prefers-color-scheme: dark) {
    &:hover {
      color: rgb(249 250 251);
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EyeSVG = styled.svg`
  display: block;
  width: 23px;
  height: 23px;
  pointer-events: none;

  .top,
  .bottom,
  .lashes {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5px;
    stroke-linecap: round;
  }

  .lashes {
    stroke-dasharray: 3px;
    stroke-dashoffset: var(--eye-offset);
  }

  .top {
    fill: var(--c-background);
    fill-opacity: var(--eye-background);
  }

  .eye {
    fill: currentColor;
    transform-origin: 10.5px 13.5px;
    transform: translate(var(--eye-x), var(--eye-y)) scale(var(--eye-s))
      translateZ(0);
    transition: transform var(--eye-duration, 0.3s);
  }
`;

interface PasswordFieldProps {
  onChange: (value: string, isValid: boolean) => void;
  className?: string;
  value?: string;
  showValidation?: boolean;
  autoComplete?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  onChange,
  className,
  value = "",
  showValidation = true,
  autoComplete,
}) => {
  const [show, setShow] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isValid, setIsValid] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const radius = 100;
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setInputValue(value);
    checkPasswordStrength(value);
  }, [value]);

  useEffect(() => {
    if (fieldRef.current) {
      const field = fieldRef.current;
      const svg = field.querySelector("svg");
      const topPath = svg?.querySelector(".top");

      timelineRef.current = gsap
        .timeline({ paused: true })
        .to(topPath!, {
          attr: {
            d: "M2 10.5C2 10.5 6.43686 15.5 10.5 15.5C14.5631 15.5 19 10.5 19 10.5",
          },
          duration: 0.1,
        })
        .to(
          field,
          {
            keyframes: [
              {
                "--eye-s": 0,
                "--eye-background": 1,
                duration: 0.1,
              },
              {
                "--eye-offset": "0px",
                duration: 0.1,
              },
            ],
          },
          0
        );
    }
  }, []);

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShow(!show);
    if (timelineRef.current) {
      if (show) {
        timelineRef.current.reverse();
      } else {
        timelineRef.current.play();
      }
    }
  };

  const updateEyePosition = () => {
    if (buttonRef.current && fieldRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const fullWidth = rect.width;
      const halfWidth = fullWidth / 2;
      const fullHeight = rect.height;
      const halfHeight = fullHeight / 2;
      const x = lastMousePosition.current.x - rect.left - halfWidth;
      const y = lastMousePosition.current.y - rect.top - halfHeight;

      const eyeX =
        (x < -halfWidth ? -halfWidth : x > fullWidth ? fullWidth : x) / 15;
      const eyeY =
        (y < -halfHeight ? -halfHeight : y > fullHeight ? fullHeight : y) / 25;

      fieldRef.current.style.setProperty("--eye-x", `${eyeX}px`);
      fieldRef.current.style.setProperty("--eye-y", `${eyeY}px`);
    }

    rafRef.current = requestAnimationFrame(updateEyePosition);
  };

  const handlePointerLeave = () => {
    if (fieldRef.current) {
      fieldRef.current.style.setProperty("--eye-x", "0px");
      fieldRef.current.style.setProperty("--eye-y", "0px");
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;

    mouseX.set(x);
    mouseY.set(y);
    lastMousePosition.current = { x: clientX, y: clientY };

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(updateEyePosition);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password); // Modifié ici
    const isLongEnough = password.length >= 14;

    const newIsValid = hasUpperCase && hasSpecialChar && isLongEnough;
    setIsValid(newIsValid);

    if (password.length === 0) {
      setPasswordStrength("");
    } else if (newIsValid) {
      setPasswordStrength("Fort");
    } else if (password.length >= 8) {
      setPasswordStrength("Moyen");
    } else {
      setPasswordStrength("Faible");
    }

    return newIsValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const newIsValid = checkPasswordStrength(newValue);
    onChange(newValue, newIsValid);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div>
      <FormField
        ref={fieldRef}
        onPointerMove={handleMouseMove}
        onPointerEnter={() => setVisible(true)}
        onPointerLeave={() => {
          setVisible(false);
          handlePointerLeave();
        }}
        className={`${className}`}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${
                visible ? radius + "px" : "0px"
              } circle at ${mouseX}px ${mouseY}px,
              rgba(237, 5, 123, 0.6),
              transparent 80%
            )
          `,
        }}>
        <div className="w-[calc(100%-4px)] h-38 bg-gray-50 dark:bg-[rgb(39,39,42)] absolute rounded-[7px]"></div>
        <Input
          type="password"
          placeholder="Mot de passe"
          autoComplete={autoComplete}
          value={inputValue}
          onChange={handleInputChange}
          className={`transform transition-all duration-300 ${
            show
              ? "translate-y-[-40px] opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100 pointer-events-auto"
          } focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600`}
        />
        <ClearInput
          type="text"
          placeholder="Mot de passe"
          autoComplete={autoComplete}
          value={inputValue}
          onChange={handleInputChange}
          className={`transform transition-all duration-300 ${
            show
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-[40px] opacity-0 pointer-events-none"
          } focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600`}
        />
        <Button
          ref={buttonRef}
          onClick={togglePasswordVisibility}
          type="button">
          <EyeSVG viewBox="0 0 21 21">
            <circle className="eye" cx="10.5" cy="10.5" r="2.25" />
            <path
              className="top"
              d="M2 10.5C2 10.5 6.43686 5.5 10.5 5.5C14.5631 5.5 19 10.5 19 10.5"
            />
            <path
              className="bottom"
              d="M2 10.5C2 10.5 6.43686 15.5 10.5 15.5C14.5631 15.5 19 10.5 19 10.5"
            />
            <g className="lashes">
              <path d="M10.5 15.5V18" />
              <path d="M14.5 14.5L15.25 17" />
              <path d="M6.5 14.5L5.75 17" />
              <path d="M3.5 12.5L2 15" />
              <path d="M17.5 12.5L19 15" />
            </g>
          </EyeSVG>
        </Button>
      </FormField>
      {showValidation && (
        <div className="mt-2 text-sm">
          <p className={`${isValid ? "text-green-500" : "text-red-500"}`}>
            {isValid
              ? "Mot de passe valide"
              : "Le mot de passe doit contenir au moins 14 caractères, une majuscule et un caractère spécial"}
          </p>
          {passwordStrength && (
            <p
              className={`
              ${passwordStrength === "Fort" ? "text-green-500" : ""}
              ${passwordStrength === "Moyen" ? "text-yellow-500" : ""}
              ${passwordStrength === "Faible" ? "text-red-500" : ""}
            `}>
              Force du mot de passe : {passwordStrength}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordField;
