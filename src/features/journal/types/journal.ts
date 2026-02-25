export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type SessionId = string;

export type DiaryEntry = {
  id: SessionId;
  title: string;
  content: string;
  dateCreated: number;
  lastEdited: number;
  mood: string;
  temperature: number | null;
  location: string;
  images: string[];
  editVersion: number;
};

export type SessionDraft = Pick<
  DiaryEntry,
  "title" | "content" | "mood" | "temperature" | "location" | "images" | "editVersion"
>;

export type WeatherInfo = {
  locationName: string;
  temperature: number | null;
  weatherCode: number | null;
  icon: string;
};

export type ActivityOption = {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
};
