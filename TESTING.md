# Course Enrollment Testing Guide

## Prerequisites

- Frontend running on http://localhost:3000
- Backend running on http://localhost:8000
- Test accounts set up (student, teacher, admin)

## Test Cases

### 1. Basic Enrollment Flow

- [ ] Login as student@example.com
- [ ] Navigate to /courses
- [ ] Click on any available course
- [ ] Click "Enroll Now"
- [ ] Verify confirmation dialog shows
- [ ] Confirm enrollment
- [ ] Verify success notification appears
- [ ] Verify "Enroll Now" changes to "Leave Course"
- [ ] Go back to /courses
- [ ] Verify course appears in "My Courses" tab

### 2. Unenrollment Flow

- [ ] While enrolled, go to course page
- [ ] Click "Leave Course"
- [ ] Verify confirmation dialog shows
- [ ] Confirm unenrollment
- [ ] Verify success notification appears
- [ ] Verify "Leave Course" changes to "Enroll Now"
- [ ] Go back to /courses
- [ ] Verify course is removed from "My Courses" tab

### 3. Edge Cases

#### Course Full

- [ ] Find/create a course at max capacity
- [ ] Verify "Course Full" button state
- [ ] Verify enrollment is prevented

#### Course Dates

- [ ] Try enrolling in a past course
- [ ] Try enrolling in a future course
- [ ] Verify appropriate messages

#### Authentication

- [ ] Let session expire (wait 30 minutes or clear cookies)
- [ ] Try to enroll
- [ ] Verify redirect to login page
- [ ] Login and verify enrollment still works

#### Multiple Enrollments

- [ ] Enroll in a course
- [ ] Try enrolling in the same course again
- [ ] Verify error message

## Error Messages to Verify

- "Course is full"
- "Already enrolled in this course"
- "Course enrollment period has ended"
- "Course enrollment hasn't started yet"
- "Authentication required"

## UI Elements to Verify

- [ ] Enrollment button states (Enroll Now, Leave Course, Course Full)
- [ ] Confirmation dialogs
- [ ] Success/Error notifications
- [ ] Loading states during enrollment/unenrollment
- [ ] Course card enrollment status
- [ ] My Courses tab updates

## Mobile Testing

- [ ] Test enrollment flow on mobile viewport
- [ ] Verify dialogs are properly centered
- [ ] Verify notifications are visible
- [ ] Test touch interactions

## Notes

- Document any unexpected behavior
- Note down any error messages that aren't clear
- Check console for any errors during the process
- Verify network requests in browser dev tools
