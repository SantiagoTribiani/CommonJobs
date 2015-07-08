﻿using CommonJobs.Application.EvalForm.Dtos;
using CommonJobs.Application.Evaluations.EmployeeSearching;
using CommonJobs.Domain.Evaluations;
using CommonJobs.Infrastructure.RavenDb;
using Raven.Client.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonJobs.Application.EvalForm.Commands
{
    public class GetEvaluationCalifications : Command<CalificationsDto>
    {
        private string _period;

        private string _evaluatedUser;

        private string _loggedUser;

        public GetEvaluationCalifications(string period, string evaluatedUser, string loggedUser)
        {
            _period = period;

            _loggedUser = loggedUser;

            _evaluatedUser = evaluatedUser;
        }

        public override CalificationsDto ExecuteWithResult()
        {
            var evId = EmployeeEvaluation.GenerateEvaluationId(_period, _evaluatedUser);
            var evaluation = RavenSession.Load<EmployeeEvaluation>(evId);

            if (evaluation == null)
            {
                throw new ApplicationException(string.Format("Error: Evaluación inexistente: {0}.", evId));
            }

            Employee_Search.Projection employee = RavenSession
                .Query<Employee_Search.Projection, Employee_Search>()
                .Customize(x => x.WaitForNonStaleResultsAsOfLastWrite())
                .Where(x => x.IsActive && x.UserName == evaluation.UserName).FirstOrDefault();

            var evaluationDto = CalificationsEvaluationDto.Create(evaluation, employee.CurrentPosition, employee.Seniority);

            var califications = RavenSession
                .Query<EvaluationCalification>()
                .Customize(x => x.WaitForNonStaleResultsAsOfLastWrite())
                .Where(x => x.EvaluationId == evId).ToList();

            if (!CanViewEvaluation(evaluationDto, califications))
            {
                throw new ApplicationException(string.Format("Error: Usuario {0} no tiene permiso para ver la evaluación {1}", _loggedUser, evId));
            }

            // If evaluation is finished
            // - Show ALWAYS company & auto

            if (evaluation.Finished)
            {
                return GetFinishedEvaluation(evaluationDto, califications);
            }

            // If loggedUser is the evaluated
            // - Show auto-eval if not RFD
            // - Show auto-eval & company if RFD

            if (_loggedUser == _evaluatedUser)
            {
                return GetAutoEvaluation(evaluationDto, califications);
            }

            // If loggedUser is responsible
            // - Show all

            if (_loggedUser == evaluationDto.ResponsibleId)
            {
                return GetEvaluation(evaluationDto, califications);
            }

            // If loggedUser is evaluator
            // - Show evluator eval

            return GetEvaluatorEvaluation(evaluationDto, califications);
        }

        private CalificationsDto GetEvaluatorEvaluation(CalificationsEvaluationDto evaluationDto, List<EvaluationCalification> califications)
        {
            return new CalificationsDto()
            {
                View = UserView.Evaluation,
                Evaluation = evaluationDto,
                Califications = califications.Where(c => _loggedUser == c.EvaluatorEmployee || c.Owner == CalificationType.Auto).ToList()
            };
        }

        private CalificationsDto GetEvaluation(CalificationsEvaluationDto evaluationDto, List<EvaluationCalification> califications)
        {
            return new CalificationsDto()
            {
                View = califications.Any(c => c.Owner == CalificationType.Company) ? UserView.Company : UserView.Responsible,
                Evaluation = evaluationDto,
                Califications = califications
            };
        }

        private CalificationsDto GetAutoEvaluation(CalificationsEvaluationDto evaluationDto, List<EvaluationCalification> califications)
        {
            if (evaluationDto.ReadyForDevolution)
            {
                return new CalificationsDto()
                {
                    View = UserView.Auto,
                    Evaluation = evaluationDto,
                    Califications = califications.Where(c => _evaluatedUser == c.EvaluatedEmployee && (c.Owner == CalificationType.Auto || c.Owner == CalificationType.Company)).ToList()
                };
            }
            else
            {
                return new CalificationsDto()
                {
                    View = UserView.Auto,
                    Evaluation = evaluationDto,
                    Califications = new List<EvaluationCalification>() { califications.Single(c => _evaluatedUser == c.EvaluatedEmployee && c.Owner == CalificationType.Auto) }
                };
            }
        }

        private CalificationsDto GetFinishedEvaluation(CalificationsEvaluationDto evaluationDto, List<EvaluationCalification> califications)
        {
            return new CalificationsDto()
            {
                View = (_loggedUser == evaluationDto.ResponsibleId)
                ? UserView.Company
                    : (_loggedUser == _evaluatedUser)
                        ? UserView.Auto
                        : UserView.Evaluation,
                Evaluation = evaluationDto,
                Califications = califications.Where(c => _evaluatedUser == c.EvaluatedEmployee && (c.Owner == CalificationType.Auto || c.Owner == CalificationType.Company)).ToList()
            };
        }

        /// <summary>
        /// Returns true if the logged user is the one being evaluated, the responsible or an additional evaluator
        /// </summary>
        /// <param name="evaluationDto"></param>
        /// <param name="califications"></param>
        /// <returns></returns>
        private bool CanViewEvaluation(CalificationsEvaluationDto evaluationDto, List<EvaluationCalification> califications)
        {
            if (_loggedUser == evaluationDto.UserName) return true;

            if (_loggedUser == evaluationDto.ResponsibleId) return true;

            if (califications.Any(c => c.EvaluatorEmployee == _loggedUser)) return true;

            return false;
        }
    }
}
