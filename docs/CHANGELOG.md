# Changelog - Career Scoring Enhancements

### 1. Scoring Logic Enhancements (`ScoringService.java`)

We have significantly upgraded the career matching algorithm by incorporating 7 previously unused data points from the `edustats` assessment. The scoring formula remains:
`Final Score = (RIASEC * 40%) + (Subject * 30%) + (Practical * 20%) + (Context * 10%)`

However, the calculation of individual components has been refined:

#### A. Subject Match (30% Weight)
*   **New Hard Filter (`e_03`):**
    *   **Logic:** Before calculating the average subject score, the system now checks if the user has actually taken the career's required `primarySubjects`.
    *   **Impact:** If a mandatory subject is missing from the user's selected subjects, the Subject Match Score is set to **0**, effectively disqualifying the career.

#### B. Practical Fit (20% Weight)
*   **Negative Filtering (`e_13` - "Jobs NOT wanted"):**
    *   **Logic:** The system scans the user's text response for keywords matching the career name or bucket.
    *   **Impact:** If a match is found (e.g., user says "I hate coding" and career is "Software Developer"), a **-50 point penalty** is applied.
*   **Positive Reinforcement (`e_12` - "Subjects Enjoyed"):**
    *   **Logic:** The system scans the text for positive mentions of the career or bucket.
    *   **Impact:** If a match is found, a **+10 point bonus** is added.

#### C. Context Fit (10% Weight)
*   **Class Rank (`e_05`):**
    *   **Logic:** Adjusts confidence for highly competitive fields (Healthcare, Core Tech, Law).
    *   **Impact:**
        *   **Top 1 / Top 5:** **+5 point bonus**.
        *   **Below Average:** **-10 point penalty**.
*   **Family/Community Sentiment (`e_08`):**
    *   **Logic:** analyzes text for sentiment keywords ("good", "proud" vs. "bad", "taboo") in relation to the career.
    *   **Impact:** **+15 bonus** for positive sentiment, **-20 penalty** for negative sentiment.
*   **Vocational Preference (`e_09`):**
    *   **Logic:** Checks alignment with the "Trades Vocational & Skilled Services" bucket.
    *   **Impact:**
        *   **"Yes, definitely":** **+25 point bonus**.
        *   **"No":** **-25 point penalty**.
*   **Long Study Duration (`e_14`):**
    *   **Logic:** Checks willingness to study for 5+ years against careers requiring MBBS, PhD, or Architecture degrees.
    *   **Impact:** If user answers "No", a **-30 point penalty** is applied to those long-duration careers.
*   **Dream Career (`e_15`):**
    *   **Logic:** Direct text match against career name or bucket.
    *   **Impact:** **+20 point bonus** if there is a match.

### 2. Documentation & Analysis Tools

*   **`career_analysis.xlsx`:** A comprehensive Excel workbook created to visualize the new scoring matrix.
    *   **Sheet 1: Career Question Matrix:** A detailed grid showing exactly how every question (`v_01` to `e_15`) impacts each of the ~35 careers.
    *   **Sheet 2: Vibematch Questions:** Reference list of personality questions and their RIASEC mappings.
    *   **Sheet 3: Edustats Questions:** Reference list of education/background questions with their new algorithmic impact descriptions.

### 3. Summary of Data Points Used

| ID | Question Topic | Usage Status | Algorithm Component |
| :--- | :--- | :--- | :--- |
| **v_01 - v_14** | RIASEC Personality | ✅ Active | RIASEC Match (40%) |
| **e_01** | Grade Level | ℹ️ Info | Metadata / Report Header |
| **e_02** | Board | ℹ️ Info | Metadata / Report Header |
| **e_03** | Subjects Taken | ✅ Active | Subject Match (Hard Filter) |
| **e_04** | Subject Grades | ✅ Active | Subject Match (30%) |
| **e_05** | Class Rank | ✅ Active | Context Fit (Competitiveness) |
| **e_06** | Extracurriculars | ✅ Active | Practical Fit (Tag Match) |
| **e_07** | Parent Careers | ✅ Active | Context Fit (Family Bonus) |
| **e_08** | Family Taboos | ✅ Active | Context Fit (Sentiment) |
| **e_09** | Vocational | ✅ Active | Context Fit (Bucket Boost) |
| **e_10** | Study Abroad | ✅ Active | Context Fit (New Age Bonus) |
| **e_11** | Work Style | ✅ Active | Context Fit (Office/Lab Bonus) |
| **e_12** | Subjects Enjoyed | ✅ Active | Practical Fit (Positive Text) |
| **e_13** | Jobs NOT Wanted | ✅ Active | Practical Fit (Negative Filter) |
| **e_14** | Long Study | ✅ Active | Context Fit (Duration Check) |
| **e_15** | Dream Career | ✅ Active | Context Fit (Direct Boost) |
