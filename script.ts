// FitCalc Pro – Faze 2
// Tridy, polymorfismus, vypis do konzole i na stranku

export {};

class User {
  public name: string;
  public weightKg: number;
  constructor(name: string, weightKg: number) {
    this.name = name;
    this.weightKg = weightKg;
  }
  public getLabel(): string {
    return this.name + " (" + this.weightKg + " kg)";
  }
}

abstract class Activity {
  public name: string;
  public durationMin: number;
  public intensity: number;
  constructor(name: string, durationMin: number, intensity: number) {
    this.name = name;
    this.durationMin = durationMin;
    this.intensity = intensity;
  }
  abstract calculateCalories(weightKg: number): number;
  abstract getPerformanceIndex(): number;
  public getSummary(weightKg: number): string {
    var cal = this.calculateCalories(weightKg);
    var idx = this.getPerformanceIndex();
    return this.name + " | " + this.durationMin + " min | intenzita: " + this.intensity + "/10 | " + cal + " kcal | index: " + idx;
  }
}

class RunningActivity extends Activity {
  public distanceKm: number;
  public paceMinsPerKm: number;
  constructor(name: string, durationMin: number, intensity: number, distanceKm: number, paceMinsPerKm: number) {
    super(name, durationMin, intensity);
    this.distanceKm = distanceKm;
    this.paceMinsPerKm = paceMinsPerKm;
  }
  public calculateCalories(weightKg: number): number {
    return Math.round(8 * weightKg * (this.durationMin / 60));
  }
  public getPerformanceIndex(): number {
    return Math.round((this.distanceKm * 10) / this.paceMinsPerKm);
  }
}

class StrengthActivity extends Activity {
  public sets: number;
  public reps: number;
  public liftWeightKg: number;
  constructor(name: string, durationMin: number, intensity: number, sets: number, reps: number, liftWeightKg: number) {
    super(name, durationMin, intensity);
    this.sets = sets;
    this.reps = reps;
    this.liftWeightKg = liftWeightKg;
  }
  public calculateCalories(weightKg: number): number {
    return Math.round(5 * weightKg * (this.durationMin / 60));
  }
  public getPerformanceIndex(): number {
    return this.sets * this.reps * this.liftWeightKg;
  }
}

class TrainingSession {
  private activities: Activity[] = [];
  private user: User;
  constructor(user: User) {
    this.user = user;
  }
  public addActivity(activity: Activity): void {
    const key = this.buildActivityKey(activity);
    for (var i = 0; i < this.activities.length; i++) {
      if (this.buildActivityKey(this.activities[i]) === key) {
        console.log("Duplicate activity skipped:", activity.getSummary(this.user.weightKg));
        return;
      }
    }
    this.activities.push(activity);
  }

  private buildActivityKey(activity: Activity): string {
    if (activity instanceof RunningActivity) {
      return [
        "Running",
        activity.name,
        activity.durationMin,
        activity.intensity,
        activity.distanceKm,
        activity.paceMinsPerKm
      ].join("|");
    } else if (activity instanceof StrengthActivity) {
      return [
        "Strength",
        activity.name,
        activity.durationMin,
        activity.intensity,
        activity.sets,
        activity.reps,
        activity.liftWeightKg
      ].join("|");
    } else {
      return [
        "Activity",
        activity.name,
        activity.durationMin,
        activity.intensity
      ].join("|");
    }
  }
  public getTotalCalories(): number {
    var total = 0;
    for (var i = 0; i < this.activities.length; i++) {
      total += this.activities[i].calculateCalories(this.user.weightKg);
    }
    return total;
  }
  public getAverageIntensity(): number {
    if (this.activities.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < this.activities.length; i++) {
      sum += this.activities[i].intensity;
    }
    return Math.round(sum / this.activities.length);
  }
  public getReport(): string[] {
    var lines: string[] = [];
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
  var nameEl = document.getElementById("userName") as HTMLInputElement;
  var weightEl = document.getElementById("userWeight") as HTMLInputElement;
  var output = document.getElementById("output") as HTMLElement;
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

(window as any).runApp = runApp;