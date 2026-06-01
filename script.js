// FitCalc Pro – Faze 2
// Tridy, polymorfismus, vypis do konzole i na stranku
class User {
    name;
    weightKg;
    constructor(name, weightKg) {
        this.name = name;
        this.weightKg = weightKg;
    }
    getLabel() {
        return this.name + " (" + this.weightKg + " kg)";
    }
}
class Activity {
    name;
    durationMin;
    intensity;
    constructor(name, durationMin, intensity) {
        this.name = name;
        this.durationMin = durationMin;
        this.intensity = intensity;
    }
    getSummary(weightKg) {
        var cal = this.calculateCalories(weightKg);
        var idx = this.getPerformanceIndex();
        return this.name + " | " + this.durationMin + " min | intenzita: " + this.intensity + "/10 | " + cal + " kcal | index: " + idx;
    }
}
class RunningActivity extends Activity {
    distanceKm;
    paceMinsPerKm;
    constructor(name, durationMin, intensity, distanceKm, paceMinsPerKm) {
        super(name, durationMin, intensity);
        this.distanceKm = distanceKm;
        this.paceMinsPerKm = paceMinsPerKm;
    }
    calculateCalories(weightKg) {
        return Math.round(8 * weightKg * (this.durationMin / 60));
    }
    getPerformanceIndex() {
        return Math.round((this.distanceKm * 10) / this.paceMinsPerKm);
    }
}
class StrengthActivity extends Activity {
    sets;
    reps;
    liftWeightKg;
    constructor(name, durationMin, intensity, sets, reps, liftWeightKg) {
        super(name, durationMin, intensity);
        this.sets = sets;
        this.reps = reps;
        this.liftWeightKg = liftWeightKg;
    }
    calculateCalories(weightKg) {
        return Math.round(5 * weightKg * (this.durationMin / 60));
    }
    getPerformanceIndex() {
        return this.sets * this.reps * this.liftWeightKg;
    }
}
class TrainingSession {
    activities = [];
    user;
    constructor(user) {
        this.user = user;
    }
    addActivity(activity) {
        const key = this.buildActivityKey(activity);
        for (var i = 0; i < this.activities.length; i++) {
            if (this.buildActivityKey(this.activities[i]) === key) {
                console.log("Duplicate activity skipped:", activity.getSummary(this.user.weightKg));
                return;
            }
        }
        this.activities.push(activity);
    }
    buildActivityKey(activity) {
        if (activity instanceof RunningActivity) {
            return [
                "Running",
                activity.name,
                activity.durationMin,
                activity.intensity,
                activity.distanceKm,
                activity.paceMinsPerKm
            ].join("|");
        }
        else if (activity instanceof StrengthActivity) {
            return [
                "Strength",
                activity.name,
                activity.durationMin,
                activity.intensity,
                activity.sets,
                activity.reps,
                activity.liftWeightKg
            ].join("|");
        }
        else {
            return [
                "Activity",
                activity.name,
                activity.durationMin,
                activity.intensity
            ].join("|");
        }
    }
    getTotalCalories() {
        var total = 0;
        for (var i = 0; i < this.activities.length; i++) {
            total += this.activities[i].calculateCalories(this.user.weightKg);
        }
        return total;
    }
    getAverageIntensity() {
        if (this.activities.length === 0)
            return 0;
        var sum = 0;
        for (var i = 0; i < this.activities.length; i++) {
            sum += this.activities[i].intensity;
        }
        return Math.round(sum / this.activities.length);
    }
    getReport() {
        var lines = [];
        lines.push("Uzivatel: " + this.user.getLabel());
        lines.push("Aktivity: " + this.activities.length);
        lines.push("Prumerna intenzita: " + this.getAverageIntensity() + "/10");
        lines.push("");
        for (var i = 0; i < this.activities.length; i++) {
            lines.push(this.activities[i].getSummary(this.user.weightKg));
        }
        lines.push("");
        lines.push("Celkem kalorii: " + this.getTotalCalories() + " kcal");
        return lines;
    }
}
function runApp() {
    var nameEl = document.getElementById("userName");
    var weightEl = document.getElementById("userWeight");
    var output = document.getElementById("output");
    var user = new User(nameEl.value || "Uzivatel", parseFloat(weightEl.value) || 75);
    var session = new TrainingSession(user);
    session.addActivity(new RunningActivity("Ranni beh", 45, 7, 7.5, 5.5));
    session.addActivity(new RunningActivity("Vecerni jogging", 30, 5, 4.0, 7.5));
    session.addActivity(new StrengthActivity("Bench press", 60, 8, 4, 10, 80));
    session.addActivity(new StrengthActivity("Drepy", 45, 9, 5, 8, 100));
    var report = session.getReport();
    var html = "";
    for (var i = 0; i < report.length; i++) {
        html += report[i] === "" ? "<br>" : "<div>" + report[i] + "</div>";
    }
    output.innerHTML = html;
    console.log(report.join("\n"));
}
window.runApp = runApp;
export {};
