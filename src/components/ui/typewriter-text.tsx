import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const TypewriterText = ({
    texts,
    className = "",
    cursorClassName = "",
    cursorChar = "|"
}: {
    texts: string[];
    className?: string;
    cursorClassName?: string;
    cursorChar?: React.ReactNode;
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        const handleType = () => {
            const fullText = texts[currentTextIndex];

            if (isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length - 1));
                setTypingSpeed(40);
            } else {
                setCurrentText(fullText.substring(0, currentText.length + 1));
                setTypingSpeed(100);
            }

            if (!isDeleting && currentText === fullText) {
                setTimeout(() => setIsDeleting(true), 3000);
            } else if (isDeleting && currentText === "") {
                setIsDeleting(false);
                setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentTextIndex, texts, typingSpeed]);

    return (
        <span className={`inline-flex items-center text-center ${className}`}>
            <span>{currentText}</span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className={cursorClassName}
            >
                {cursorChar}
            </motion.span>
        </span>
    );
};
