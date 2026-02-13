import { createAvatar } from '@dicebear/core';
import { initials, glass } from '@dicebear/collection';

// 2. Create an object to look up styles by name
const avatarStyles = {
  initials,
  glass
};

export const getDiceBearAvatar = (seed, styleName = 'initials') => {
    const style = avatarStyles[styleName] || glass;
    const finalSeed = seed || 'default-seed';

    if (!style) {
        throw new Error(`DiceBear style '${styleName}' is not imported in dicebear.js.`);
    }

    // 3. Create the avatar object
    const avatar = createAvatar(style, {
        seed: finalSeed,
    });

    const svgString = avatar.toString();
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

    return dataUri;
};