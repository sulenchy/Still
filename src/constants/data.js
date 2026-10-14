export const memories = [
  {
    layout: "row-span-2",
    alt: "Two sisters sitting in a field",
    src: "https://images.unsplash.com/photo-1611890279484-2f70df6730fe?auto=format&fit=crop&w=1000&q=86",
    date: "July 2023",
    title: "The summer we stayed out late",
  },
  {
    layout: "col-span-2",
    alt: "Mother and child sharing a quiet moment",
    src: "https://images.unsplash.com/photo-1784013225972-34a4e810e825?auto=format&fit=crop&w=1200&q=86",
    date: "April 2024",
    title: "Sunday at Nana’s",
  },
  {
    layout: "",
    alt: "Grandmother with her granddaughter",
    src: "https://images.unsplash.com/photo-1505075288090-14733a88df88?auto=format&fit=crop&w=900&q=86",
    date: "October 2021",
    title: "Her favorite stories",
  },
  {
    layout: "",
    alt: "Parent carrying a child outdoors",
    src: "https://images.unsplash.com/photo-1628676306092-1238ef1dc851?auto=format&fit=crop&w=900&q=86",
    date: "June 2022",
    title: "Tiny explorer",
  },
  {
    layout: "col-span-2",
    alt: "Family enjoying a picnic",
    src: "https://images.unsplash.com/photo-1681311311317-a0561a8eef74?auto=format&fit=crop&w=1200&q=86",
    date: "May 2024",
    title: "Picnic weather",
  },
  {
    layout: "row-span-2",
    alt: "Father holding his daughter",
    src: "https://images.unsplash.com/photo-1717883300138-f1fadd7d04cc?auto=format&fit=crop&w=900&q=86",
    date: "August 2023",
    title: "Always up here",
  },
];

export const filters = ["All memories", "Family", "Mara", "Leo", "Nana"];

export const steps = [
  ["01", "Capture", "Bring in a photo or everyday moment."],
  ["02", "Tell", "Add voices, notes, places, and people."],
  ["03", "Preserve", "Keep it safe for every chapter ahead."],
];

export const roles = [
  ["O", "01", "Owner", "Keeps the archive and decides who’s invited.", "bg-forest text-white"],
  ["F", "02", "Family member", "Adds memories, stories, and shared chapters.", "bg-peach"],
  ["C", "03", "Contributor", "Helps fill in the moments they remember.", "bg-[#e9d5a7]"],
  ["V", "04", "Viewer", "Enjoys the archive, without changing a thing.", "bg-pale"],
];
