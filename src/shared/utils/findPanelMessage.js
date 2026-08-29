async function findPanelMessage(channel, botUserId, marker) {
  const messages = await channel.messages.fetch({ limit: 50 });
  return (
    messages.find(
      (message) =>
        message.author?.id === botUserId &&
        containsText(message.components, marker),
    ) ?? null
  );
}

function containsText(components, marker) {
  return (components ?? []).some((component) => {
    const content = component.content ?? component.data?.content;
    return (
      content?.includes(marker) || containsText(component.components, marker)
    );
  });
}

module.exports = { findPanelMessage };
