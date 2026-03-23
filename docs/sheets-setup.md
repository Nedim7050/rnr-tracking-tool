# Google Sheets Setup

This application uses Google Sheets as a Headless CMS and database.

## Architecture

Create a single blank Google Sheet in your AIESEC shared drive. The Apps Script you deploy (see `apps-script-deploy.md`) will **automatically** create the following tab structures if they don't exist when an action is fired, or you can create them manually for clarity:

1. **Members**
   Columns: `member_id`, `full_name`, `department_code`, `department_label`, `position_code`, `position_label`, `active`, `member_code`, `created_at`

2. **MetricCatalog**
   Columns: `metric_id`, `metric_name`, `category`, `scope`, `department_scope`, `position_scope`, `counts_for_tracking`, `counts_for_voting`, `formula_type`, `base_points`, `requires_quantity`, `requires_proof`, `proof_label`, `active`

   *Example Metric:*
   - `metric_name` = CMS
   - `category` = VOTING
   - `counts_for_voting` = TRUE
   - `formula_type` = FIXED
   - `base_points` = 1

3. **Submissions**
   Columns: `submission_id`, `submitted_at`, `member_id`, `member_name`, `department_code`, `position_code`, `metric_id`, `metric_name`, `subtype`, `quantity`, `percent_value`, `manual_score`, `proof_url`, `proof_type`, `event_date`, `period_key`, `status`, `reviewed_by`, `review_note`, `reviewed_at`

4. **Events**
   Columns: `event_id`, `event_type`, `title`, `event_date`, `department_scope`, `period_key`

5. **Attendance**
   Columns: `attendance_id`, `event_id`, `member_id`, `present`, `excused`, `entered_by`, `entered_at`

6. **VPNotes**
   Columns: `note_id`, `member_id`, `period_key`, `vp_note`, `comment`, `entered_by`, `entered_at`

7. **Sanctions**
   Columns: `sanction_id`, `member_id`, `sanction_type`, `points`, `event_date`, `period_key`, `comment`

8. **VotingPeriods**
   Columns: `period_key`, `label`, `start_date`, `end_date`, `min_voting_score`, `active`

9. **AuditLog**
   Columns: `log_id`, `action_type`, `entity_type`, `entity_id`, `performed_by`, `performed_at`, `details`
