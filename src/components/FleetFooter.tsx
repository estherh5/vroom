import "./fleet.css";

// Copied byte-identical across the fleet. In flow, never fixed.
export function FleetFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="fleet-footer">
      <a href="https://crystalprism.io">© 2017–{year} Crystal Prism</a>
    </footer>
  );
}
