import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component'; // Make sure this path is correct
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        AppComponent, // Importing AppComponent instead of declaring it
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  // Unit Tests
  describe('Unit Tests', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should validate postal codes', () => {
      const invalidCodes = ['9679', '9681', '9682'];
      const validCodes = ['9600', '9601', '9602'];

      invalidCodes.forEach((code) => {
        const control = component.mortgageForm.get('postalCode');
        control?.setValue(code);
        expect(control?.valid).toBeFalse();
      });

      validCodes.forEach((code) => {
        const control = component.mortgageForm.get('postalCode');
        control?.setValue(code);
        expect(control?.valid).toBeTrue();
      });
    });

    it('should calculate maximum loan amount correctly without student loan', () => {
      component.mortgageForm.setValue({
        annualIncome: '60000',
        fixedInterestPeriod: '30',
        partnerIncome: '30000',
        hasStudentLoan: false,
        postalCode: '9600',
      });

      component.calculateLoan();

      const combinedIncome = (60000 + 30000) * 5; // Total income multiplied by 5
      const interestRate = 0.05; // For 30 years
      const totalInterest = combinedIncome * interestRate * 30; // Total interest calculation
      const expectedLoanAmount = combinedIncome - totalInterest; // Total loan amount after interest deduction

      expect(component.maxLoanAmount).toEqual(expectedLoanAmount);
    });

    it('should calculate maximum loan amount correctly with student loan', () => {
      component.mortgageForm.setValue({
        annualIncome: '60000',
        fixedInterestPeriod: '30',
        partnerIncome: '30000',
        hasStudentLoan: true,
        postalCode: '9600',
      });

      component.calculateLoan();

      const combinedIncome = (60000 + 30000) * 5; // Total income multiplied by 5
      const interestRate = 0.05; // For 30 years
      const totalInterest = combinedIncome * interestRate * 30; // Total interest calculation
      const loanWithInterest = combinedIncome - totalInterest; // Subtract interest from max loan amount
      const reducedLoanAmount = loanWithInterest * 0.75; // Apply 25% reduction for student loan

      expect(component.maxLoanAmount).toEqual(reducedLoanAmount);
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should disable the submit button when the form is invalid', () => {
      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      );
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should enable the submit button when the form is valid', () => {
      component.mortgageForm.setValue({
        annualIncome: '60000',
        fixedInterestPeriod: '30',
        partnerIncome: '30000',
        hasStudentLoan: false,
        postalCode: '9600',
      });

      fixture.detectChanges();
      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      );
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should display maximum loan amount after calculation', () => {
      component.mortgageForm.setValue({
        annualIncome: '60000',
        fixedInterestPeriod: '30',
        partnerIncome: '30000',
        hasStudentLoan: false,
        postalCode: '9600',
      });
      component.calculateLoan();
      fixture.detectChanges();

      const combinedIncome = (60000 + 30000) * 5;
      const interestRate = 0.05; // for 30 years from interestRates Map
      const totalInterest = combinedIncome * interestRate * 30;
      const expectedLoanAmount = combinedIncome - totalInterest;

      const loanAmountElement = fixture.debugElement.query(By.css('p'));
      expect(loanAmountElement.nativeElement.textContent).toContain(
        `Maximum loan amount: ${expectedLoanAmount}`
      );
    });

    it('should show error message for invalid postal code', () => {
      component.mortgageForm.get('postalCode')?.setValue('9679');
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('p'));
      expect(errorMessage.nativeElement.textContent).toContain(
        'Invalid postal code. Please enter a valid postal code.'
      );
    });
  });
});
