const { AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");

function createDuneBanner({ filename, title, subtitle, detail }) {
  const canvas = createCanvas(1200, 400);
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#180f0a");
  gradient.addColorStop(0.55, "#6f3d20");
  gradient.addColorStop(1, "#d2a85a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(8, 5, 3, 0.78)";
  context.fillRect(0, 0, 760, canvas.height);
  context.fillStyle = "#f3d39b";
  context.font = "bold 52px sans-serif";
  context.fillText(String(title).toUpperCase(), 64, 110);
  context.fillStyle = "#e6bd79";
  context.font = "26px sans-serif";
  context.fillText(String(subtitle ?? "ARRAKIS").toUpperCase(), 67, 160);
  context.fillStyle = "#ead5ad";
  context.font = "22px sans-serif";
  context.fillText(String(detail ?? "DUNE: AWAKENING"), 67, 235);
  return new AttachmentBuilder(canvas.toBuffer("image/png"), {
    name: filename,
  });
}

async function createMemberBanner({ filename, title, member }) {
  const attachment = createDuneBanner({
    filename,
    title,
    subtitle: member.user.tag,
    detail: "DUNE: AWAKENING COMMUNITY",
  });
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: "png", size: 256 }));
  const canvas = createCanvas(1200, 400);
  const context = canvas.getContext("2d");
  context.drawImage(await loadImage(attachment.attachment), 0, 0);
  context.save();
  context.beginPath();
  context.arc(1010, 200, 105, 0, Math.PI * 2);
  context.clip();
  context.drawImage(avatar, 905, 95, 210, 210);
  context.restore();
  return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: filename });
}

module.exports = { createDuneBanner, createMemberBanner };
