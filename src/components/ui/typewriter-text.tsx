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

    const longestText = texts.reduce((a, b) => (a.length > b.length ? a : b), "");

    return (
        <span className={`relative inline-block text-center ${className}`}>
            {/* Invisible placeholder to reserve space (height/width) */}
            <span className="opacity-0 select-none pointer-events-none inline-block text-center whitespace-normal">
                {longestText}
                <span className="inline-block">{cursorChar}</span>
            </span>

            {/* Actual typing text overlaid absolutely */}
            <span className="absolute inset-0 flex justify-center items-center text-center">
                <span className="inline-block whitespace-normal">
                    {currentText}
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className={`inline-block align-middle ${cursorClassName}`}
                    >
                        {cursorChar}
                    </motion.span>
                </span>
            </span>
        </span>
    );
};
