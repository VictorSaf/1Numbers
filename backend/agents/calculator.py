"""Pure numerology calculator agent - no LLM required."""
import asyncio
from datetime import datetime
from typing import Optional, List
from .types import CalculationResult, NumerologySystem


class CalculatorAgent:
    """
    Pure numerological calculations.
    No LLM required - pure mathematics.
    Results are highly cacheable.
    """

    PYTHAGOREAN_MAP = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }

    CHALDEAN_MAP = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
        'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
    }

    MASTER_NUMBERS = {11, 22, 33}
    KARMIC_DEBTS = {13, 14, 16, 19}

    def __init__(self):
        """Initialize calculator agent."""
        self.system = NumerologySystem.PYTHAGOREAN

    def _normalize_name(self, name: str) -> str:
        """Remove spaces and convert to uppercase."""
        return name.replace(' ', '').upper()

    def _reduce_to_single_digit(
        self, num: int, preserve_master: bool = True
    ) -> int:
        """
        Reduce number to single digit.
        Master numbers (11, 22, 33) are preserved.
        """
        while num > 9:
            if preserve_master and num in self.MASTER_NUMBERS:
                return num
            num = sum(int(d) for d in str(num))
        return num

    def _calculate_letter_sum(self, text: str, system: NumerologySystem) -> int:
        """Calculate sum of letter values."""
        mapping = self.PYTHAGOREAN_MAP if system == NumerologySystem.PYTHAGOREAN else self.CHALDEAN_MAP
        normalized = self._normalize_name(text)
        return sum(mapping.get(char, 0) for char in normalized)

    def _validate_date(self, day: int, month: int, year: int) -> None:
        """Validate birth date."""
        try:
            datetime(year, month, day)
        except ValueError as e:
            raise ValueError(f"Invalid date: {day}/{month}/{year}") from e

    def calculate_life_path(self, day: int, month: int, year: int) -> int:
        """
        Life Path Number = Birth Date reduced to single digit.
        Most important number in numerology.
        """
        self._validate_date(day, month, year)
        total = day + month + year
        return self._reduce_to_single_digit(total)

    def calculate_expression_number(self, name: str, system: NumerologySystem = NumerologySystem.PYTHAGOREAN) -> int:
        """
        Expression (Destiny) Number = Full name reduced.
        How you express yourself and navigate life.
        """
        total = self._calculate_letter_sum(name, system)
        return self._reduce_to_single_digit(total)

    def calculate_soul_urge(self, name: str, system: NumerologySystem = NumerologySystem.PYTHAGOREAN) -> int:
        """
        Soul Urge (Heart's Desire) = Vowels in name.
        What you truly desire deep within.
        """
        mapping = self.PYTHAGOREAN_MAP if system == NumerologySystem.PYTHAGOREAN else self.CHALDEAN_MAP
        normalized = self._normalize_name(name)
        vowels = 'AEIOUWY'
        total = sum(mapping.get(char, 0) for char in normalized if char in vowels)
        return self._reduce_to_single_digit(total)

    def calculate_personality_number(self, name: str, system: NumerologySystem = NumerologySystem.PYTHAGOREAN) -> int:
        """
        Personality Number = Consonants in name.
        How others perceive you.
        """
        mapping = self.PYTHAGOREAN_MAP if system == NumerologySystem.PYTHAGOREAN else self.CHALDEAN_MAP
        normalized = self._normalize_name(name)
        consonants = set(normalized) - set('AEIOUWY')
        total = sum(mapping.get(char, 0) for char in normalized if char in consonants)
        return self._reduce_to_single_digit(total)

    def calculate_birthday_number(self, day: int) -> int:
        """
        Birthday Number = Day of birth reduced.
        Your natural talents and gifts.
        """
        return self._reduce_to_single_digit(day)

    def calculate_maturity_number(
        self, name: str, day: int, month: int, year: int,
        system: NumerologySystem = NumerologySystem.PYTHAGOREAN
    ) -> int:
        """
        Maturity Number = Expression + Life Path.
        Who you become later in life.
        """
        expr = self.calculate_expression_number(name, system)
        life_path = self.calculate_life_path(day, month, year)
        return self._reduce_to_single_digit(expr + life_path)

    def calculate_hidden_passion(self, name: str, system: NumerologySystem = NumerologySystem.PYTHAGOREAN) -> int:
        """
        Hidden Passion = Most frequent number in name.
        What drives you on a subconscious level.
        """
        mapping = self.PYTHAGOREAN_MAP if system == NumerologySystem.PYTHAGOREAN else self.CHALDEAN_MAP
        normalized = self._normalize_name(name)
        digit_counts = {}
        
        for char in normalized:
            if char in mapping:
                digit = mapping[char]
                digit_counts[digit] = digit_counts.get(digit, 0) + 1
        
        if not digit_counts:
            return 1
        
        return max(digit_counts, key=digit_counts.get)

    def calculate_subconscious_self(self, name: str, system: NumerologySystem = NumerologySystem.PYTHAGOREAN) -> int:
        """
        Subconscious Self = Missing number in name (if any).
        What you may lack or need to develop.
        """
        mapping = self.PYTHAGOREAN_MAP if system == NumerologySystem.PYTHAGOREAN else self.CHALDEAN_MAP
        normalized = self._normalize_name(name)
        present_digits = set()
        
        for char in normalized:
            if char in mapping:
                present_digits.add(mapping[char])
        
        # Find first missing digit 1-9
        for digit in range(1, 10):
            if digit not in present_digits:
                return digit
        
        return 9  # If no missing digits

    def calculate_karmic_debt(self, day: int, month: int, year: int) -> Optional[int]:
        """
        Karmic Debt Numbers = 13, 14, 16, 19.
        Lessons to learn in this lifetime.
        """
        total = day + month + year
        if total in self.KARMIC_DEBTS:
            return total
        return None

    def detect_master_numbers(self, name: str, day: int, month: int, year: int) -> List[int]:
        """
        Detect all master numbers (11, 22, 33) in profile.
        """
        masters = set()
        
        # Life path
        total = day + month + year
        if 10 < total < 100 and (total // 10 == total % 10):
            masters.add(total)
        
        # Expression
        expr_total = self._calculate_letter_sum(name, NumerologySystem.PYTHAGOREAN)
        if 10 < expr_total < 100 and (expr_total // 10 == expr_total % 10):
            masters.add(expr_total)
        
        return sorted(list(masters))

    async def calculate_profile(
        self,
        name: str,
        day: int,
        month: int,
        year: int,
        system: NumerologySystem = NumerologySystem.PYTHAGOREAN
    ) -> CalculationResult:
        """
        Calculate complete numerology profile.
        Runs calculations in parallel where possible.
        """
        self._validate_date(day, month, year)
        self.system = system
        
        # Run calculations in parallel
        results = await asyncio.gather(
            self._async_life_path(day, month, year),
            self._async_expression(name, system),
            self._async_soul_urge(name, system),
            self._async_personality(name, system),
            self._async_birthday(day),
            self._async_maturity(name, day, month, year, system),
            self._async_hidden_passion(name, system),
            self._async_subconscious(name, system),
            self._async_karmic_debt(day, month, year),
            self._async_master_numbers(name, day, month, year),
        )
        
        return CalculationResult(
            life_path=results[0],
            expression=results[1],
            soul_urge=results[2],
            personality=results[3],
            birthday_number=results[4],
            maturity_number=results[5],
            hidden_passion=results[6],
            subconscious_self=results[7],
            karmic_debt=results[8],
            master_numbers=results[9]
        )

    # Async wrappers for parallel execution
    async def _async_life_path(self, day: int, month: int, year: int) -> int:
        return await asyncio.to_thread(self.calculate_life_path, day, month, year)

    async def _async_expression(self, name: str, system: NumerologySystem) -> int:
        return await asyncio.to_thread(self.calculate_expression_number, name, system)

    async def _async_soul_urge(self, name: str, system: NumerologySystem) -> int:
        return await asyncio.to_thread(self.calculate_soul_urge, name, system)

    async def _async_personality(self, name: str, system: NumerologySystem) -> int:
        return await asyncio.to_thread(self.calculate_personality_number, name, system)

    async def _async_birthday(self, day: int) -> int:
        return await asyncio.to_thread(self.calculate_birthday_number, day)

    async def _async_maturity(self, name: str, day: int, month: int, year: int, system: NumerologySystem) -> int:
        return await asyncio.to_thread(self.calculate_maturity_number, name, day, month, year, system)

    async def _async_hidden_passion(self, name: str, system: NumerologySystem) -> int:
        return await asyncio.to_thread(self.calculate_hidden_passion, name, system)

    async def _async_subconscious(self, name: str, system: NumerologySystem) -> int:
        return await asyncio.to_thread(self.calculate_subconscious_self, name, system)

    async def _async_karmic_debt(self, day: int, month: int, year: int) -> Optional[int]:
        return await asyncio.to_thread(self.calculate_karmic_debt, day, month, year)

    async def _async_master_numbers(self, name: str, day: int, month: int, year: int) -> List[int]:
        return await asyncio.to_thread(self.detect_master_numbers, name, day, month, year)
