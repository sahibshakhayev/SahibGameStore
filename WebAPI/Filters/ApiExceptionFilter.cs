using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SahibGameStore.WebAPI.Filters
{
    public class ApiExceptionFilter : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            context.HttpContext.Response.StatusCode = 500;

            context.Result = new JsonResult(new
            {
                context.Exception.Message,
                context.Exception.StackTrace,
            });
        }
    }
}