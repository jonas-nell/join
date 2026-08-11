// These are the possible badge colors.
const PROFILE_COLORS = [
    '#FF7A00',
    '#FF5EB3',
    '#6E52FF',
    '#9327FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF745E',
    '#FFA35E',
    '#FC71FF',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
    '#FF4646',
    '#FFBB2B',
];


// Selects a consistent color from above array based on the user's unique ID.
// Same user ID = same color
//
// The color is calculated every time the profiles are displayed.
// Therefore, it does not need to be stored in database...

export function createProfileColor(userId: string): string {
    let number = 0;

    // Look at every character in the UUID.
    for (const character of userId) {
        // Convert the character into a number and combine it
        // with the numbers from the previous characters.
        number = character.charCodeAt(0) + ((number << 5) - number);
    }

    // PROFILE_COLORS.length is currently 15.
    // The result is therefore a number between 0 and 14.
    const colorIndex = Math.abs(number) % PROFILE_COLORS.length;

    // Return the color at the calculated position.
    return PROFILE_COLORS[colorIndex];
}
