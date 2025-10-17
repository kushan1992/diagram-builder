import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "../page";

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the useAuth hook
jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
  });

  it("renders sign in form by default", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("switches to sign up form when clicking the sign up link", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText("Don't have an account? Sign up"));

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
    expect(screen.getByLabelText("Account Type")).toBeInTheDocument();
  });

  it("handles sign in submission", async () => {
    render(<LoginPage />);

    const email = "test@example.com";
    const password = "password123";

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(email, password);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles sign up submission", async () => {
    render(<LoginPage />);

    // Switch to sign up form
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));

    const email = "test@example.com";
    const password = "password123";
    const role = "editor";

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: password },
    });
    fireEvent.change(screen.getByLabelText("Account Type"), {
      target: { value: role },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(email, password, role);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on sign in failure", async () => {
    mockSignIn.mockRejectedValueOnce(
      new Error("Firebase: Error (auth/invalid-email).")
    );

    const { container } = render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.submit(container.querySelector("form")!);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(
        screen.getByText("The email address is not valid.")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state during form submission", async () => {
    // Create a delayed promise that we can control
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { container } = render(<LoginPage />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.submit(container.querySelector("form")!);

    // Check for loading state
    expect(await screen.findByText("Processing...")).toBeInTheDocument();

    // Wait for the redirect
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 2000 }
    );
  });

  it("redirects to dashboard if user is already logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "test@example.com" },
      loading: false,
    });

    render(<LoginPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("shows loading state during form submission", async () => {
    // Create a promise that we can resolve manually
    let resolveSignIn: () => void;
    const signInPromise = new Promise<void>((resolve) => {
      resolveSignIn = resolve;
    });

    mockSignIn.mockImplementation(() => signInPromise);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    // Verify loading state
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Processing..." })
    ).toBeDisabled();

    // Resolve the sign-in promise
    resolveSignIn();

    // Wait for the redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
