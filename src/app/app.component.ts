import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  mortgageForm: FormGroup;
  maxLoanAmount: number | null = null;
  interestRates = new Map<number, number>([
    [1, 0.02],
    [5, 0.03],
    [10, 0.035],
    [20, 0.045],
    [30, 0.05],
  ]);

  constructor(private fb: FormBuilder) {
    this.mortgageForm = this.fb.group({
      annualIncome: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      fixedInterestPeriod: [
        '',
        [Validators.required, Validators.pattern(/^(1|5|10|20|30)$/)],
      ],
      partnerIncome: ['', [Validators.pattern(/^\d*$/)]],
      hasStudentLoan: [false],
      postalCode: ['', [Validators.required, this.postalCodeValidator]],
    });
  }

  postalCodeValidator(control: any) {
    const invalidPostalCodes = ['9679', '9681', '9682'];
    return invalidPostalCodes.includes(control.value)
      ? { invalidPostalCode: true }
      : null;
  }

  calculateLoan() {
    if (this.mortgageForm.valid) {
      const annualIncome = Number(this.mortgageForm.value.annualIncome);
      const fixedInterestPeriod = Number(
        this.mortgageForm.value.fixedInterestPeriod
      );
      const partnerIncome = Number(this.mortgageForm.value.partnerIncome) || 0;
      const hasStudentLoan = this.mortgageForm.value.hasStudentLoan;

      const combinedIncome = annualIncome + partnerIncome;
      let maxLoanAmount = combinedIncome * 5;

      if (hasStudentLoan) {
        maxLoanAmount *= 0.5; // Reduces loan by 25%
      }

      const interestRate = this.interestRates.get(fixedInterestPeriod) || 0;
      const totalInterest = maxLoanAmount * interestRate * fixedInterestPeriod;
      maxLoanAmount -= totalInterest; // Deduct interest from max loan amount

      this.maxLoanAmount = maxLoanAmount;
    }
  }
}
