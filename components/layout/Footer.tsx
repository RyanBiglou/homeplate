import Link from "next/link";
import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-homeplate-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-homeplate-orange" />
              <span className="text-lg font-bold">HomePlate</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Connecting communities through home-cooked meals. A registered
              Internet Food Service Intermediary (IFSI) under California law.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              For Customers
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/browse"
                  className="text-gray-300 hover:text-homeplate-orange"
                >
                  Browse Cooks
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-gray-300 hover:text-homeplate-orange"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              For Cooks
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/signup/cook"
                  className="text-gray-300 hover:text-homeplate-orange"
                >
                  Become a Cook
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-homeplate-orange"
                >
                  Cook Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-300">
                  IFSI Registered
                </span>
              </li>
              <li>
                <span className="text-gray-300">
                  CA Retail Food Code Ch. 11.6
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} HomePlate. All meals are prepared
            in permitted home kitchens under MEHKO regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
