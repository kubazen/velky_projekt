"use strict";
class Activity {
    name;
    durationMin;
    intensity;
    constructor(name, durationMin, intensity) {
        this.name = name;
        this.durationMin = durationMin;
        this.intensity = intensity;
    }
    getSummary() {
        return `Aktivita: ${this.name}, Doba trvání: ${this.durationMin} min, Intenzita: ${this.intensity}/10`;
    }
    getDuration() {
        return this.durationMin;
    }
    getName() {
        return this.name;
    }
}
class RunningActivity extends Activity {
    distanceKm;
    paceMinsPerKm;
    constructor(durationMin, intensity, distanceKm, paceMinsPerKm) {
        super("Běh", durationMin, intensity);
        this.distanceKm = distanceKm;
        this.paceMinsPerKm = paceMinsPerKm;
    }
    calculateCalories(userWeightKg) {
        let met = this.paceMinsPerKm < 5 ? 11.5 : 8.3;
        return Math.round(this.durationMin * (met * 3.5 * userWeightKg / 200));
    }
    getPerformanceIndex() {
        if (this.paceMinsPerKm === 0)
            return 0;
        return Math.round((this.distanceKm / this.paceMinsPerKm) * this.intensity * 10);
    }
}
class StrengthActivity extends Activity {
    sets;
    reps;
    weightKg;
    constructor(durationMin, intensity, sets, reps, weightKg) {
        super("Silový trénink", durationMin, intensity);
        this.sets = sets;
        this.reps = reps;
        this.weightKg = weightKg;
    }
    calculateCalories(userWeightKg) {
        let baseMet = 5.0;
        return Math.round(this.durationMin * (baseMet * 3.5 * userWeightKg / 200) * (this.intensity / 5));
    }
    getPerformanceIndex() {
        return Math.round((this.sets * this.reps * this.weightKg) / 100 * (this.intensity / 10));
    }
}
class CyclingActivity extends Activity {
    distanceKm;
    averageSpeedKmh;
    elevationGainM;
    constructor(durationMin, intensity, distanceKm, averageSpeedKmh, elevationGainM) {
        super("Cyklistika", durationMin, intensity);
        this.distanceKm = distanceKm;
        this.averageSpeedKmh = averageSpeedKmh;
        this.elevationGainM = elevationGainM;
    }
    calculateCalories(userWeightKg) {
        let effectiveMet = 7.5 + (this.averageSpeedKmh * 0.1) + (this.elevationGainM / 500);
        return Math.round(this.durationMin * (effectiveMet * 3.5 * userWeightKg / 200));
    }
    getPerformanceIndex() {
        return Math.round((this.distanceKm * (this.averageSpeedKmh / 20)) + (this.elevationGainM * 0.05));
    }
}
class SwimmingActivity extends Activity {
    distanceMeters;
    strokeType;
    constructor(durationMin, intensity, distanceMeters, strokeType) {
        super("Plavání", durationMin, intensity);
        this.distanceMeters = distanceMeters;
        this.strokeType = strokeType;
    }
    calculateCalories(userWeightKg) {
        let met = 7.0;
        if (this.strokeType === "Kraul")
            met = 10.0;
        if (this.strokeType === "Motýlek")
            met = 13.8;
        if (this.strokeType === "Znak")
            met = 8.0;
        return Math.round(this.durationMin * (met * 3.5 * userWeightKg / 200));
    }
    getPerformanceIndex() {
        if (this.durationMin === 0)
            return 0;
        let speedModifier = this.strokeType === "Mot�lek" ? 1.5 : 1.0;
        return Math.round((this.distanceMeters / this.durationMin) * speedModifier);
    }
}
class TrainingSession {
    activities = [];
    userName;
    userWeightKg;
    constructor(userName, userWeightKg) {
        this.userName = userName;
        this.userWeightKg = userWeightKg;
    }
    addActivity(activity) {
        this.activities.push(activity);
    }
    calculateTotalCalories() {
        let total = 0;
        for (let activity of this.activities) {
            total += activity.calculateCalories(this.userWeightKg);
        }
        return total;
    }
    calculateTotalDuration() {
        let total = 0;
        for (let activity of this.activities) {
            total += activity.getDuration();
        }
        return total;
    }
    getActivities() {
        return this.activities;
    }
    getUserName() {
        return this.userName;
    }
    getUserWeight() {
        return this.userWeightKg;
    }
}
let currentSession = null;
const activityTypeSelect = document.getElementById("activityType");
const addActivityBtn = document.getElementById("addActivityBtn");
const activitiesContainer = document.getElementById("activitiesContainer");
const userOverview = document.getElementById("userOverview");
const sessionSummary = document.getElementById("sessionSummary");
const totalTimeSpan = document.getElementById("totalTime");
const totalCaloriesSpan = document.getElementById("totalCalories");
activityTypeSelect?.addEventListener("change", () => {
    const selectedType = activityTypeSelect.value;
    document.querySelectorAll(".activity-fields").forEach(el => el.classList.add("hidden"));
    const targetBlock = document.getElementById(`inputs-${selectedType}`);
    if (targetBlock) {
        targetBlock.classList.remove("hidden");
    }
});
addActivityBtn?.addEventListener("click", () => {
    const nameInput = document.getElementById("userName").value.trim();
    const weightInput = parseFloat(document.getElementById("userWeight").value);
    if (!nameInput || isNaN(weightInput)) {
        alert("Prosím, vyplňte nejprve korektní jméno a váhu sportovce.");
        return;
    }
    if (!currentSession || currentSession.getUserName() !== nameInput || currentSession.getUserWeight() !== weightInput) {
        currentSession = new TrainingSession(nameInput, weightInput);
        activitiesContainer.innerHTML = "";
    }
    const duration = parseInt(document.getElementById("duration").value);
    const intensity = parseInt(document.getElementById("intensity").value);
    const type = activityTypeSelect.value;
    let newActivity;
    switch (type) {
        case "running":
            const runDist = parseFloat(document.getElementById("runDistance").value);
            const runPace = parseFloat(document.getElementById("runPace").value);
            newActivity = new RunningActivity(duration, intensity, runDist, runPace);
            break;
        case "strength":
            const sSets = parseInt(document.getElementById("strengthSets").value);
            const sReps = parseInt(document.getElementById("strengthReps").value);
            const sWeight = parseFloat(document.getElementById("strengthWeight").value);
            newActivity = new StrengthActivity(duration, intensity, sSets, sReps, sWeight);
            break;
        case "cycling":
            const cDist = parseFloat(document.getElementById("bikeDistance").value);
            const cSpeed = parseFloat(document.getElementById("bikeSpeed").value);
            const cElev = parseFloat(document.getElementById("bikeElevation").value);
            newActivity = new CyclingActivity(duration, intensity, cDist, cSpeed, cElev);
            break;
        case "swimming":
            const sDistM = parseInt(document.getElementById("swimDistance").value);
            const sStroke = document.getElementById("swimStroke").value;
            newActivity = new SwimmingActivity(duration, intensity, sDistM, sStroke);
            break;
        default:
            return;
    }
    currentSession.addActivity(newActivity);
    updateUI();
});
function updateUI() {
    if (!currentSession)
        return;
    const session = currentSession;
    userOverview.textContent = `Sportovec: ${session.getUserName()} (${session.getUserWeight()} kg) — Aktuálně zaznamenáno ${session.getActivities().length} aktivit.`;
    activitiesContainer.innerHTML = "";
    session.getActivities().forEach(act => {
        const card = document.createElement("div");
        let typeClass = "running";
        if (act instanceof StrengthActivity)
            typeClass = "strength";
        if (act instanceof CyclingActivity)
            typeClass = "cycling";
        if (act instanceof SwimmingActivity)
            typeClass = "swimming";
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
