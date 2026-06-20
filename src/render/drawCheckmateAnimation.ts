export function drawRedFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  progress: number
) {
  ctx.save();
  ctx.globalAlpha = progress;

  const cellCenter = x + size / 2;
  const bottomY = y + size * 0.85;
  // The pole rises/extends upwards as progress increases
  const topY = y + size * (0.85 - 0.65 * progress);

  // Draw Flagpole
  ctx.strokeStyle = "#4b5563"; // sleek cool gray
  ctx.lineWidth = Math.max(2.5, size * 0.04);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cellCenter - size * 0.15, bottomY);
  ctx.lineTo(cellCenter - size * 0.15, topY);
  ctx.stroke();

  // Draw a gold knob at the top of the pole
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(cellCenter - size * 0.15, topY, Math.max(2, size * 0.03), 0, Math.PI * 2);
  ctx.fill();

  // Only draw the flag banner once the pole starts growing
  if (progress > 0.1) {
    const flagProgress = (progress - 0.1) / 0.9;
    ctx.save();
    ctx.globalAlpha = flagProgress;

    const flagWidth = size * 0.4;
    const flagHeight = size * 0.28;
    const startX = cellCenter - size * 0.15;

    // Use a wave phase based on progress to animate the wave slightly
    const wavePhase = progress * Math.PI * 6;
    
    // Vibrant rose-red flag color
    const flagGrad = ctx.createLinearGradient(startX, topY, startX + flagWidth, topY + flagHeight);
    flagGrad.addColorStop(0, "#f43f5e");
    flagGrad.addColorStop(1, "#be123c");
    ctx.fillStyle = flagGrad;

    ctx.beginPath();
    ctx.moveTo(startX, topY);

    // Top edge of the flag with wave effect
    ctx.bezierCurveTo(
      startX + flagWidth * 0.35,
      topY - size * 0.05 * Math.sin(wavePhase),
      startX + flagWidth * 0.7,
      topY + size * 0.05 * Math.sin(wavePhase),
      startX + flagWidth,
      topY + size * 0.02
    );
    // Right vertical edge
    ctx.lineTo(startX + flagWidth, topY + flagHeight);
    // Bottom edge of the flag with corresponding wave
    ctx.bezierCurveTo(
      startX + flagWidth * 0.7,
      topY + flagHeight + size * 0.05 * Math.sin(wavePhase),
      startX + flagWidth * 0.35,
      topY + flagHeight - size * 0.05 * Math.sin(wavePhase),
      startX,
      topY + flagHeight
    );
    ctx.closePath();
    ctx.fill();

    // Dark red flag border
    ctx.strokeStyle = "#9f1239";
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

export function drawCrown(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  progress: number
) {
  ctx.save();

  // Drop animation: drops from -size * 0.4 down to -size * 0.1
  const opacity = Math.min(1, progress * 1.5);
  
  // Clean landing bounce using decaying sinusoid
  const bounce = Math.sin(progress * Math.PI * 2.5) * (1 - progress) * 0.15;
  const yOffset = -size * (0.02 + bounce);

  // Position at the top center of the piece square
  ctx.translate(x + size / 2, y + yOffset);
  
  // Scale / pop-in bounce
  const scale = 0.6 + 0.4 * progress;
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;

  // Crown geometry
  const w = size * 0.5;
  const h = size * 0.3;
  const cx = -w / 2;
  const cy = -h;

  // Gorgeous gold gradient
  const goldGrad = ctx.createLinearGradient(cx, cy, cx, cy + h);
  goldGrad.addColorStop(0, "#fef08a"); // light yellow
  goldGrad.addColorStop(0.4, "#f59e0b"); // amber-500
  goldGrad.addColorStop(1, "#b45309"); // amber-700
  ctx.fillStyle = goldGrad;

  // Render 3-peak classic crown path
  ctx.beginPath();
  ctx.moveTo(cx, cy + h); // bottom-left
  ctx.lineTo(cx + w, cy + h); // bottom-right
  ctx.lineTo(cx + w * 0.95, cy + h * 0.35); // far-right peak
  ctx.lineTo(cx + w * 0.72, cy + h * 0.72); // right valley
  ctx.lineTo(cx + w * 0.5, cy + h * 0.15); // tall center peak
  ctx.lineTo(cx + w * 0.28, cy + h * 0.72); // left valley
  ctx.lineTo(cx + w * 0.05, cy + h * 0.35); // far-left peak
  ctx.closePath();
  ctx.fill();

  // High contrast warm-brown outline
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = Math.max(1.5, size * 0.035);
  ctx.lineJoin = "round";
  ctx.stroke();

  // Draw ruby/emerald gemstones on peaks
  const drawGem = (gx: number, gy: number, radius: number, fill: string) => {
    ctx.beginPath();
    ctx.arc(gx, gy, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  };

  const gemRadius = Math.max(2, size * 0.045);
  // Ruby on left/right peaks, Sapphire on center peak
  drawGem(cx + w * 0.05, cy + h * 0.35, gemRadius, "#ef4444");
  drawGem(cx + w * 0.5, cy + h * 0.15, gemRadius * 1.1, "#3b82f6");
  drawGem(cx + w * 0.95, cy + h * 0.35, gemRadius, "#ef4444");

  ctx.restore();
}
