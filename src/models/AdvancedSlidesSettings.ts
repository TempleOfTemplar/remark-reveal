import { PaneType } from "./PaneType";

export interface AdvancedSlidesSettings {
    port: string;
    autoReload: boolean;
    exportDirectory: string;
    enableOverview: boolean;
    enableChalkboard: boolean;
    enableMenu: boolean;
    enablePointer: boolean;
    enableTimeBar: boolean;
    theme: string;
    highlightTheme: string;
    transition: string;
    transitionSpeed: string;
    controls: boolean;
    progress: boolean;
    slideNumber: boolean;
    showGrid: boolean;
    autoComplete: string;
    paneMode: PaneType;
}