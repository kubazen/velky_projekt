abstract class Activity {
    protected name: string;
    protected durationMin: number;
    protected intensity: number;

    constructor(name: string, durationMin: number, intensity: number) {
        this.name = name;
        this.durationMin = durationMin;
        this.intensity = intensity;
    }

    public abstract calculateCalories(userWeightKg: number): number;
    public abstract getPerformanceIndex(): number;

    public getSummary(): string {
        return `Aktivita: ${this.name}, Doba trvání: ${this.durationMin} min, Intenzita: ${this.intensity}/10`;
    }

    public getDuration(): number {
        return this.durationMin;
    }

    public getName(): string {
        return this.name;
    }
}

class RunningActivity extends Activity {
    private distanceKm: number;
    private paceMinsPerKm: number;

    constructor(durationMin: number, intensity: number, distanceKm: number, paceMinsPerKm: number) {
        super("Běh", durationMin, intensity);
        this.distanceKm = distanceKm;
        this.paceMinsPerKm = paceMinsPerKm;
    }

    public calculateCalories(userWeightKg: number): number {
        let met = this.paceMinsPerKm < 5 ? 11.5 : 8.3;
        return Math.round(this.durationMin * (met * 3.5 * userWeightKg / 200));
    }

    public getPerformanceIndex(): number {
        if (this.paceMinsPerKm === 0) return 0;
        return Math.round((this.distanceKm / this.paceMinsPerKm) * this.intensity * 10);
    }
}

class StrengthActivity extends Activity {
    private sets: number;
    private reps: number;
    private weightKg: number;

    constructor(durationMin: number, intensity: number, sets: number, reps: number, weightKg: number) {
        super("Silový trénink", durationMin, intensity);
        this.sets = sets;
        this.reps = reps;
        this.weightKg = weightKg;
    }

    public calculateCalories(userWeightKg: number): number {
        let baseMet = 5.0;
        return Math.round(this.durationMin * (baseMet * 3.5 * userWeightKg / 200) * (this.intensity / 5));
    }

    public getPerformanceIndex(): number {
        return Math.round((this.sets * this.reps * this.weightKg) / 100 * (this.intensity / 10));
    }
}

class CyclingActivity extends Activity {
    private distanceKm: number;
    private averageSpeedKmh: number;
    private elevationGainM: number;

    constructor(durationMin: number, intensity: number, distanceKm: number, averageSpeedKmh: number, elevationGainM: number) {
        super("Cyklistika", durationMin, intensity);
        this.distanceKm = distanceKm;
        this.averageSpeedKmh = averageSpeedKmh;
        this.elevationGainM = elevationGainM;
    }

    public calculateCalories(userWeightKg: number): number {
        let effectiveMet = 7.5 + (this.averageSpeedKmh * 0.1) + (this.elevationGainM / 500);
        return Math.round(this.durationMin * (effectiveMet * 3.5 * userWeightKg / 200));
    }

    public getPerformanceIndex(): number {
        return Math.round((this.distanceKm * (this.averageSpeedKmh / 20)) + (this.elevationGainM * 0.05));
    }
}

class SwimmingActivity extends Activity {
    private distanceMeters: number;
    private strokeType: string;

    constructor(durationMin: number, intensity: number, distanceMeters: number, strokeType: string) {
        super("Plavání", durationMin, intensity);
        this.distanceMeters = distanceMeters;
        this.strokeType = strokeType;
    }

    public calculateCalories(userWeightKg: number): number {
        let met = 7.0;
        if (this.strokeType === "Kraul") met = 10.0;
        if (this.strokeType === "Motýlek") met = 13.8;
        if (this.strokeType === "Znak") met = 8.0;
        return Math.round(this.durationMin * (met * 3.5 * userWeightKg / 200));
    }

    public getPerformanceIndex(): number {
        if (this.durationMin === 0) return 0;
        let speedModifier = this.strokeType === "Mot�lek" ? 1.5 : 1.0;
        return Math.round((this.distanceMeters / this.durationMin) * speedModifier);
    }
}

class TrainingSession {
    private activities: Activity[] = [];
    private userName: string;
    private userWeightKg: number;

    constructor(userName: string, userWeightKg: number) {
        this.userName = userName;
        this.userWeightKg = userWeightKg;
    }

    public addActivity(activity: Activity): void {
        this.activities.push(activity);
    }

    public calculateTotalCalories(): number {
        let total = 0;
        for (let activity of this.activities) {
            total += activity.calculateCalories(this.userWeightKg);
        }
        return total;
    }

    public calculateTotalDuration(): number {
        let total = 0;
        for (let activity of this.activities) {
            total += activity.getDuration();
        }
        return total;
    }

    public getActivities(): Activity[] {
        return this.activities;
    }

    public getUserName(): string {
        return this.userName;
    }

    public getUserWeight(): number {
        return this.userWeightKg;
    }
}

let currentSession: TrainingSession | null = null;

const activityTypeSelect = document.getElementById("activityType") as HTMLSelectElement;
const addActivityBtn = document.getElementById("addActivityBtn") as HTMLButtonElement;
const activitiesContainer = document.getElementById("activitiesContainer") as HTMLDivElement;
const userOverview = document.getElementById("userOverview") as HTMLDivElement;
const sessionSummary = document.getElementById("sessionSummary") as HTMLDivElement;

const totalTimeSpan = document.getElementById("totalTime") as HTMLSpanElement;
const totalCaloriesSpan = document.getElementById("totalCalories") as HTMLSpanElement;

activityTypeSelect?.addEventListener("change", () => {
    const selectedType = activityTypeSelect.value;
    document.querySelectorAll(".activity-fields").forEach(el => el.classList.add("hidden"));
    const targetBlock = document.getElementById(`inputs-${selectedType}`);
    if (targetBlock) {
        targetBlock.classList.remove("hidden");
    }
});

addActivityBtn?.addEventListener("click", () => {
    const nameInput = (document.getElementById("userName") as HTMLInputElement).value.trim();
    const weightInput = parseFloat((document.getElementById("userWeight") as HTMLInputElement).value);
    if (!nameInput || isNaN(weightInput)) {
        alert("Prosím, vyplňte nejprve korektní jméno a váhu sportovce.");
        return;
    }

    if (!currentSession || currentSession.getUserName() !== nameInput || currentSession.getUserWeight() !== weightInput) {
        currentSession = new TrainingSession(nameInput, weightInput);
        activitiesContainer.innerHTML = "";
    }

    const duration = parseInt((document.getElementById("duration") as HTMLInputElement).value);
    const intensity = parseInt((document.getElementById("intensity") as HTMLInputElement).value);
    const type = activityTypeSelect.value;
    let newActivity: Activity;

    switch (type) {
        case "running":
            const runDist = parseFloat((document.getElementById("runDistance") as HTMLInputElement).value);
            const runPace = parseFloat((document.getElementById("runPace") as HTMLInputElement).value);
            newActivity = new RunningActivity(duration, intensity, runDist, runPace);
            break;
        case "strength":
            const sSets = parseInt((document.getElementById("strengthSets") as HTMLInputElement).value);
            const sReps = parseInt((document.getElementById("strengthReps") as HTMLInputElement).value);
            const sWeight = parseFloat((document.getElementById("strengthWeight") as HTMLInputElement).value);
            newActivity = new StrengthActivity(duration, intensity, sSets, sReps, sWeight);
            break;
        case "cycling":
            const cDist = parseFloat((document.getElementById("bikeDistance") as HTMLInputElement).value);
            const cSpeed = parseFloat((document.getElementById("bikeSpeed") as HTMLInputElement).value);
            const cElev = parseFloat((document.getElementById("bikeElevation") as HTMLInputElement).value);
            newActivity = new CyclingActivity(duration, intensity, cDist, cSpeed, cElev);
            break;
        case "swimming":
            const sDistM = parseInt((document.getElementById("swimDistance") as HTMLInputElement).value);
            const sStroke = (document.getElementById("swimStroke") as HTMLSelectElement).value;
            newActivity = new SwimmingActivity(duration, intensity, sDistM, sStroke);
            break;
        default:
            return;
    }

    currentSession.addActivity(newActivity);
    updateUI();
});

function updateUI() {
    if (!currentSession) return;
    const session = currentSession;

    userOverview.textContent = `Sportovec: ${session.getUserName()} (${session.getUserWeight()} kg) — Aktuálně zaznamenáno ${session.getActivities().length} aktivit.`;
    activitiesContainer.innerHTML = "";
    session.getActivities().forEach(act => {
        const card = document.createElement("div");
        let typeClass = "running";
        if (act instanceof StrengthActivity) typeClass = "strength";
        if (act instanceof CyclingActivity) typeClass = "cycling";
        if (act instanceof SwimmingActivity) typeClass = "swimming";
        card.className = `card ${typeClass}`;
        const calories = act.calculateCalories(session.getUserWeight());
        const index = act.getPerformanceIndex();
        card.innerHTML = `
            <h4>${act.getName()}</h4>
            <p>${act.getSummary()}</p>
            <p class="metrics">Spáleno: ${calories} kcal | Výkonnostní index: ${index}</p>
        `;
        activitiesContainer.appendChild(card);
    });

    totalTimeSpan.textContent = session.calculateTotalDuration().toString();
    totalCaloriesSpan.textContent = session.calculateTotalCalories().toString();
    sessionSummary.classList.remove("hidden");
}
