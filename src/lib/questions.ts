export type Question = {
  id: number;
  level: number;
  title: string;
  concept: string;
  problem: string;
  expectedOutput?: string;
  sampleSolution: string;
};

export const questions: Question[] = [
  {
    id: 1,
    level: 1,
    title: "Hello World",
    concept: "print()",
    problem: "Write a program that prints exactly: Hello World",
    expectedOutput: "Hello World",
    sampleSolution: "print(\"Hello World\")"
  },
  {
    id: 2,
    level: 2,
    title: "Print Your Name",
    concept: "print()",
    problem: "Print your name on one line, then print \"Welcome to coding camp\" on the next line.",
    sampleSolution: "print(\"Alex\")\nprint(\"Welcome to coding camp\")"
  },
  {
    id: 3,
    level: 3,
    title: "Simple Addition",
    concept: "Math with print()",
    problem: "Print the answer to 47 + 25.",
    expectedOutput: "72",
    sampleSolution: "print(47 + 25)"
  },
  {
    id: 4,
    level: 4,
    title: "Variables",
    concept: "Storing values",
    problem: "Create a variable called `score` and set it to 100. Print the score.",
    expectedOutput: "100",
    sampleSolution: "score = 100\nprint(score)"
  },
  {
    id: 5,
    level: 5,
    title: "Variable Math",
    concept: "Math with variables",
    problem: "Create two variables `a = 8` and `b = 6`. Print their product (a times b).",
    expectedOutput: "48",
    sampleSolution: "a = 8\nb = 6\nprint(a * b)"
  },
  {
    id: 6,
    level: 6,
    title: "User Input",
    concept: "input()",
    problem: "Ask the user for their name with the prompt \"What is your name? \". Then print \"Hello \" followed by their name.",
    sampleSolution: "name = input(\"What is your name? \")\nprint(\"Hello \" + name)"
  },
  {
    id: 7,
    level: 7,
    title: "Input and Math",
    concept: "int() and input()",
    problem: "Ask the user for a number. Print that number doubled.",
    sampleSolution: "num = int(input(\"Enter a number: \"))\nprint(num * 2)"
  },
  {
    id: 8,
    level: 8,
    title: "If Statement",
    concept: "if and comparison",
    problem: "Ask the user for their age. If they are 18 or older, print \"Adult\". Otherwise print nothing.",
    sampleSolution: "age = int(input(\"Age? \"))\nif age >= 18:\n    print(\"Adult\")"
  },
  {
    id: 9,
    level: 9,
    title: "If / Else",
    concept: "if / else",
    problem: "Ask the user for a number. If it is positive (greater than 0), print \"Positive\". Otherwise print \"Not positive\".",
    sampleSolution: "num = int(input(\"Number? \"))\nif num > 0:\n    print(\"Positive\")\nelse:\n    print(\"Not positive\")"
  },
  {
    id: 10,
    level: 10,
    title: "If / Elif / Else",
    concept: "Multiple branches",
    problem: "Ask the user for a test score (0 to 100). Print:\n- \"A\" if the score is 90 or above\n- \"B\" if the score is 80 to 89\n- \"C\" if the score is 70 to 79\n- \"F\" otherwise",
    sampleSolution: "score = int(input(\"Score? \"))\nif score >= 90:\n    print(\"A\")\nelif score >= 80:\n    print(\"B\")\nelif score >= 70:\n    print(\"C\")\nelse:\n    print(\"F\")"
  },
  {
    id: 11,
    level: 11,
    title: "For Loop",
    concept: "for and range()",
    problem: "Print the numbers 1 through 10, one per line.",
    sampleSolution: "for i in range(1, 11):\n    print(i)"
  },
  {
    id: 12,
    level: 12,
    title: "Loop and Sum",
    concept: "for loop with a running total",
    problem: "Add up the numbers from 1 to 100. Print the total.",
    expectedOutput: "5050",
    sampleSolution: "total = 0\nfor i in range(1, 101):\n    total = total + i\nprint(total)"
  },
  {
    id: 13,
    level: 13,
    title: "While Loop",
    concept: "while loop",
    problem: "Start with a variable `count = 1`. While count is less than 6, print \"Hello\" and add 1 to count. (You should see \"Hello\" printed 5 times.)",
    sampleSolution: "count = 1\nwhile count < 6:\n    print(\"Hello\")\n    count = count + 1"
  },
  {
    id: 14,
    level: 14,
    title: "FizzBuzz Light",
    concept: "Loops and if statements together",
    problem: "Print the numbers 1 through 20. But:\n- If the number is divisible by 3, print \"Fizz\" instead.\n- If the number is divisible by 5, print \"Buzz\" instead.\n- Otherwise print the number.\n- (Hint: use the % operator. A number is divisible by 3 if `n % 3 == 0`)",
    sampleSolution: "for i in range(1, 21):\n    if i % 3 == 0:\n        print(\"Fizz\")\n    elif i % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(i)"
  },
  {
    id: 15,
    level: 15,
    title: "Password Checker (Boss Level)",
    concept: "Strings, if statements, logic",
    problem: "Ask the user for a password. Check all of these:\n- Is it at least 8 characters long?\n- Does it contain a number? (Hint: loop through each character. Use the function `char.isdigit()` which returns True if char is 0-9.)\n\nIf both are true, print \"Strong password\". Otherwise print \"Weak password\".",
    sampleSolution: "pw = input(\"Password: \")\nlong_enough = len(pw) >= 8\nhas_number = False\nfor char in pw:\n    if char.isdigit():\n        has_number = True\n\nif long_enough and has_number:\n    print(\"Strong password\")\nelse:\n    print(\"Weak password\")"
  }
];
