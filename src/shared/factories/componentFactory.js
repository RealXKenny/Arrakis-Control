const {
  ContainerBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");

function createContainer({ title, body, color = 0xc58b45, children = [] }) {
  const container = new ContainerBuilder().setAccentColor(color);
  if (title)
    container.addTextDisplayComponents((text) => text.setContent(title));
  if (body) container.addTextDisplayComponents((text) => text.setContent(body));
  if (children.length)
    container.addSeparatorComponents((separator) =>
      separator.setSpacing(SeparatorSpacingSize.Small),
    );
  for (const child of children) child(container);
  return container;
}

function createV2Response(components, files = []) {
  return {
    content: null,
    embeds: null,
    components,
    files,
    flags: MessageFlags.IsComponentsV2,
  };
}

module.exports = { createContainer, createV2Response };
