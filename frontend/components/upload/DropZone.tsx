import { useRef, useState } from "react";

type DropZoneProps = {
    onFileSelected: (file: File) => void;
    disabled?: boolean;
};

export default function DropZone({ onFileSelected, disabled = false }: DropZoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (!disabled) {
        setDragActive(true);
        }
    }
    
    function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        if (disabled) {
        return;
        }

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
        onFileSelected(droppedFile);
        }
    }

    function handleInputChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
        onFileSelected(selectedFile);
        }

        // Allows the same file to be selected again.
        event.target.value = "";
    }

    function handleClick() {
        if (!disabled) {
        inputRef.current?.click();
        }
    }

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
                }
            }}
            className={[
                "rounded-xl border-2 border-dashed p-10 text-center transition",
                disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer",
                dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-700 bg-white",
            ].join(" ")}
        >
        
        <p className="text-lg font-medium">
            {dragActive
            ? "Drop your TXT file here"
            : "Drag & Drop a TXT file here"}
        </p>

        <p className="mt-2 text-sm text-gray-500">
            or click to browse
        </p>
            
        <input
            ref={inputRef}
            type="file"
            accept=".txt, text/plain"
            className="hidden"
            disabled={disabled}
            onChange={handleInputChange}
        />

        </div>
    );
}