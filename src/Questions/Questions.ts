import readline from 'readline';

export class Questions {
  rl: readline.ReadLine;

  constructor(closeEvent: Function) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.rl.on('close', () => {
      closeEvent();
    });
  }

  close(): void {
    this.rl.close();
  }

  async newQuestion(message: string): Promise<string> {
    return new Promise((resolve, _) => {
      this.rl.question(message, (response) => {
        resolve(response);
      });
    });
  }
}
