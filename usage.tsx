import React, { useEffect, useRef, useState } from "react";

const PixelArtComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!imageFile) return;

    const fetchData = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx) return;

      try {
        const formData = new FormData();
        formData.append("image", imageFile);
        // https://pixelated-iconography.onrender.com/upload
        const response = await fetch("http://localhost:4567/upload", {
          method: "POST",
          body: formData,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
        const data = await response.json();
        drawPixelArt(data.data, ctx, canvas.width, canvas.height);
      } catch (error) {
        console.error("Error fetching JSON:", error);
      }
    };

    fetchData();
  }, [imageFile]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const drawPixelArt = (
    data: number[][],
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const dimension = data.length;
    const pixelSize = calculatePixelSize(canvasWidth, canvasHeight, dimension);
    const dotRadius = pixelSize / 2;
    const colorMap: { [key: number]: string } = {
      0: "black",
      1: "black",
      2: "transparent",
    };

    const renderWidth = dimension * pixelSize;
    const renderHeight = dimension * pixelSize;
    const xOffset = (canvasWidth - renderWidth) / 2;
    const yOffset = (canvasHeight - renderHeight) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    data.forEach((row, y) => {
      row.forEach((value, x) => {
        ctx.fillStyle = colorMap[value];
        ctx.beginPath();
        ctx.arc(
          x * pixelSize + xOffset + dotRadius,
          y * pixelSize + yOffset + dotRadius,
          dotRadius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    });
  };

  const calculatePixelSize = (
    canvasWidth: number,
    canvasHeight: number,
    dimension: number
  ): number => {
    const minDimension = Math.min(canvasWidth, canvasHeight);
    return Math.floor(minDimension / dimension);
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />
      <br />
      <br />
      <canvas
        ref={canvasRef}
        width={128} // Initial dimension set to 128
        height={128} // Initial dimension set to 128
        style={{ border: "1px solid #000", maxWidth: "100%", height: "auto" }}
      ></canvas>
    </>
  );
};

export default PixelArtComponent;
